import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { enhancedCapture } from "../services/enhanced-capture";
import { documentStorage, type StoredDocument } from "../services/document-storage";
import { remoteAI } from "../lib/ai-assistant";
import { createModuleLogger } from "../utils/app-logger";
import { useToast } from "../hooks/use-toast";
import { BarChart3, FileText, Calendar, Search, Sparkles, Download, Trash2 } from 'lucide-react';

const log = createModuleLogger('Reports');

interface DocumentStats {
  totalDocuments: number;
  documentsByType: Record<string, number>;
  unsyncedCount: number;
  totalSize: number;
}

interface AIReport {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
  type: 'summary' | 'analysis' | 'insights';
}

export default function ReportsScreen() {
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [stats, setStats] = useState<DocumentStats>({ 
    totalDocuments: 0, 
    documentsByType: {}, 
    unsyncedCount: 0, 
    totalSize: 0 
  });
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [aiReports, setAiReports] = useState<AIReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();

  useEffect(() => {
    loadDocumentsAndStats();
  }, [selectedType, searchText]);

  const loadDocumentsAndStats = async () => {
    try {
      setIsLoading(true);
      log.info('Loading documents and stats', { selectedType, searchText });

      // Load documents based on filters
      const filter = {
        type: selectedType === 'all' ? undefined : selectedType as any,
        searchText: searchText || undefined
      };

      const [docsData, statsData] = await Promise.all([
        documentStorage.searchDocuments(filter),
        documentStorage.getStorageStats()
      ]);

      setDocuments(docsData);
      setStats(statsData);
      
      log.info('Documents and stats loaded', { 
        documentsCount: docsData.length, 
        totalSize: statsData.totalSize 
      });

    } catch (error) {
      log.error('Failed to load documents and stats', error as Error);
      toast({
        title: 'Loading Error',
        description: 'Failed to load document data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIReport = async (reportType: 'summary' | 'analysis' | 'insights') => {
    try {
      setIsGeneratingReport(true);
      log.info('Generating AI report', { reportType });

      // Get recent documents for context
      const recentDocs = await enhancedCapture.getRecentDocuments(20);
      
      // Prepare data for AI analysis
      const documentSummary = recentDocs.map(doc => ({
        type: doc.type,
        date: doc.createdAt,
        medicines: doc.analysis.extractedData.medicines?.map(m => m.name) || [],
        total: doc.analysis.extractedData.total,
        summary: doc.analysis.rawText.substring(0, 300)
      }));

      let prompt = '';
      let reportTitle = '';

      switch (reportType) {
        case 'summary':
          prompt = `Generate a comprehensive summary report for our pharmacy document analysis system. 
            
            Here's the data from ${documentSummary.length} recent documents:
            ${JSON.stringify(documentSummary, null, 2)}
            
            Please provide:
            1. Overall document processing summary
            2. Most common document types and patterns
            3. Key medicines and trends identified
            4. Total transactions processed
            5. Notable insights or recommendations
            
            Format as a professional pharmacy management report.`;
          reportTitle = 'Document Processing Summary';
          break;

        case 'analysis':
          prompt = `Analyze the pharmacy document data for business insights:
            
            Document Data: ${JSON.stringify(documentSummary, null, 2)}
            
            Provide analysis on:
            1. Medicine popularity and demand patterns
            2. Revenue trends from bills and invoices
            3. Prescription patterns and compliance
            4. Inventory recommendations based on document patterns
            5. Operational efficiency insights
            
            Focus on actionable business intelligence.`;
          reportTitle = 'Business Intelligence Analysis';
          break;

        case 'insights':
          prompt = `Generate strategic insights from our pharmacy document processing:
            
            Data: ${JSON.stringify(documentSummary, null, 2)}
            
            Provide insights on:
            1. Market trends visible in the processed documents
            2. Customer behavior patterns
            3. Seasonal or temporal patterns in medicine demands
            4. Recommendations for inventory optimization
            5. Process improvements for document handling
            
            Think like a pharmacy business consultant.`;
          reportTitle = 'Strategic Insights & Recommendations';
          break;
      }

      const aiResponse = await remoteAI.ask(prompt, {
        currentScreen: 'Reports',
        recentActions: ['Generate AI Report']
      });

      const newReport: AIReport = {
        id: crypto.randomUUID(),
        title: reportTitle,
        content: aiResponse,
        timestamp: new Date(),
        type: reportType
      };

      setAiReports(prev => [newReport, ...prev]);
      
      toast({
        title: 'Report Generated',
        description: `${reportTitle} created successfully`,
        variant: 'default'
      });

      log.info('AI report generated successfully', { reportType, reportId: newReport.id });

    } catch (error) {
      log.error('Failed to generate AI report', error as Error);
      toast({
        title: 'Report Generation Failed',
        description: 'Could not generate AI report. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      log.info('Deleting document', { documentId });
      
      const success = await enhancedCapture.deleteDocument(documentId);
      
      if (success) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        toast({
          title: 'Document Deleted',
          description: 'Document removed successfully',
          variant: 'default'
        });
        
        // Refresh stats
        loadDocumentsAndStats();
      } else {
        throw new Error('Delete operation failed');
      }
    } catch (error) {
      log.error('Failed to delete document', error as Error);
      toast({
        title: 'Delete Failed',
        description: 'Could not delete document',
        variant: 'destructive'
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bill': return '🧾';
      case 'prescription': return '💊';
      case 'invoice': return '📄';
      default: return '📋';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bill': return 'bg-yellow-100 text-yellow-800';
      case 'prescription': return 'bg-green-100 text-green-800';
      case 'invoice': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI-Powered Reports</h1>
          <p className="text-sm text-muted-foreground">Document analysis and business insights</p>
        </div>
        <Button 
          onClick={() => generateAIReport('summary')}
          disabled={isGeneratingReport}
          className="ml-4"
          data-testid="generate-report-button"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isGeneratingReport ? 'Generating...' : 'Generate Report'}
        </Button>
      </header>

      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalDocuments}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center">
                <FileText className="w-4 h-4 mr-1" />
                Total Documents
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.documentsByType.bill || 0}</div>
              <div className="text-sm text-muted-foreground">🧾 Bills</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.documentsByType.prescription || 0}</div>
              <div className="text-sm text-muted-foreground">💊 Prescriptions</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.documentsByType.invoice || 0}</div>
              <div className="text-sm text-muted-foreground">📄 Invoices</div>
            </CardContent>
          </Card>
        </div>

        {/* AI Report Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              AI-Generated Reports
            </CardTitle>
            <CardDescription>
              Generate intelligent reports and insights from your document data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button 
                onClick={() => generateAIReport('summary')}
                disabled={isGeneratingReport}
                variant="outline"
                size="sm"
                data-testid="report-summary"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Summary Report
              </Button>
              <Button 
                onClick={() => generateAIReport('analysis')}
                disabled={isGeneratingReport}
                variant="outline"
                size="sm"
                data-testid="report-analysis"
              >
                <Search className="w-4 h-4 mr-2" />
                Business Analysis
              </Button>
              <Button 
                onClick={() => generateAIReport('insights')}
                disabled={isGeneratingReport}
                variant="outline"
                size="sm"
                data-testid="report-insights"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Strategic Insights
              </Button>
            </div>

            {/* Display AI Reports */}
            {aiReports.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium">Generated Reports</h4>
                {aiReports.map(report => (
                  <Card key={report.id} className="border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{report.title}</CardTitle>
                        <Badge variant={
                          report.type === 'summary' ? 'default' :
                          report.type === 'analysis' ? 'secondary' : 'outline'
                        }>
                          {report.type}
                        </Badge>
                      </div>
                      <CardDescription>{formatDate(report.timestamp)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap text-sm">{report.content}</pre>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Document Management</CardTitle>
            <CardDescription>Search and manage analyzed documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Search documents..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full"
                  data-testid="search-documents"
                />
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]" data-testid="filter-type">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="bill">Bills</SelectItem>
                  <SelectItem value="prescription">Prescriptions</SelectItem>
                  <SelectItem value="invoice">Invoices</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Documents List */}
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">Loading documents...</div>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No documents found</h3>
                <p className="text-muted-foreground">
                  {searchText || selectedType !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Start capturing documents with the Smart Action button'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map(doc => (
                  <Card key={doc.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="text-2xl">{getTypeIcon(doc.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge className={getTypeColor(doc.type)}>
                                {doc.type}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatDate(doc.createdAt)}
                              </span>
                              {!doc.synced && (
                                <Badge variant="outline" className="text-xs">Offline</Badge>
                              )}
                            </div>
                            <h4 className="font-medium text-sm truncate">{doc.originalFileName}</h4>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {doc.analysis.rawText.substring(0, 150)}...
                            </p>
                            {doc.analysis.extractedData.medicines && doc.analysis.extractedData.medicines.length > 0 && (
                              <div className="mt-2">
                                <span className="text-xs text-muted-foreground">Medicines: </span>
                                <span className="text-xs">
                                  {doc.analysis.extractedData.medicines.slice(0, 3).map(m => m.name).join(', ')}
                                  {doc.analysis.extractedData.medicines.length > 3 && ` +${doc.analysis.extractedData.medicines.length - 3} more`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteDocument(doc.id)}
                          className="text-destructive hover:text-destructive"
                          data-testid={`delete-document-${doc.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Storage Stats */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Storage Used:</span>
              <span className="font-medium">{formatFileSize(stats.totalSize)}</span>
            </div>
            {stats.unsyncedCount > 0 && (
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">Unsynced Documents:</span>
                <Badge variant="outline">{stats.unsyncedCount}</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}