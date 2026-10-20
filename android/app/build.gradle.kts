plugins {
    id("com.android.application")
}

val buildNumber = (System.getenv("GITHUB_RUN_NUMBER") ?: "1").toInt()

android {
    namespace = "dk.plan2028.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "dk.plan2028.app"
        minSdk = 26
        targetSdk = 34
        versionCode = buildNumber
        versionName = "1.0.$buildNumber"
    }

    // Samme nøgle hver gang, så nye versioner kan installeres oven på den gamle uden at miste data.
    signingConfigs {
        create("plan") {
            storeFile = file("plan2028.keystore")
            storePassword = "plan2028"
            keyAlias = "plan2028"
            keyPassword = "plan2028"
        }
    }

    buildTypes {
        getByName("release") {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("plan")
        }
        getByName("debug") {
            signingConfig = signingConfigs.getByName("plan")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    lint {
        checkReleaseBuilds = false
        abortOnError = false
    }
}
