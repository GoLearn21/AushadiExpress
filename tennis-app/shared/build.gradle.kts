plugins {
    kotlin("multiplatform")
    kotlin("plugin.serialization")
}

kotlin {
    jvmToolchain(21)
    jvm()
    // iOS / Android targets are added once the toolchain is available on a Mac runner.
    // The domain layer is target-agnostic by construction: no expect/actual in :shared.

    sourceSets {
        commonMain.dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.6.1")
            implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")
            implementation("com.squareup.okio:okio:3.9.1")
        }
        commonTest.dependencies {
            implementation(kotlin("test"))
        }
    }

    compilerOptions {
        freeCompilerArgs.add("-Xexpect-actual-classes")
    }
}
