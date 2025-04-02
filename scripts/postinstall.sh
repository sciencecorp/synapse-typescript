#!/bin/bash

echo "Postinstall - downloading synapse-api"

# Platform detection
IS_WINDOWS=false
if [ "$OS" = "Windows_NT" ] || [ "$OSTYPE" = "msys" ] || [ "$OSTYPE" = "cygwin" ]; then
    IS_WINDOWS=true
fi

# If synapse-api directory already exists, skip download
if [ -d "synapse-api" ]; then
    echo " - synapse-api directory already exists, skipping download"
    exit 0
fi

# If we have git, try to update the submodule
HAS_GIT=false
if command -v git >/dev/null 2>&1 && git rev-parse --git-dir >/dev/null 2>&1; then
    HAS_GIT=true
    echo " - Git detected, attempting to update submodule..."

    if git submodule update --init synapse-api; then
        echo " - Successfully updated synapse-api submodule"
        exit 0
    else
        echo " - Failed to update submodule, falling back to download..."
    fi
fi

# Else, fallback to downloading from github
echo "Downloading synapse-api..."

if [ "$HAS_GIT" = true ]; then
    REF_LIB=$(git rev-parse HEAD)
else
    REF_LIB=$(node -p "require('./package.json').version")
    if [ -z "$REF_LIB" ]; then
        echo " - Failed to get version from package.json"
        exit 1
    fi
    REF_LIB=v$REF_LIB
fi

echo "- Looking up synapse-api ref for synapse-typescript ref $REF_LIB"

CURL_OPTS=()
CURL_OPTS+=(-H "Accept: application/vnd.github+json")
CURL_OPTS+=(-H "X-GitHub-Api-Version: 2022-11-28")
if [ -n "$SCIENCE_CORPORATION_SYNAPSE_TOKEN" ]; then
    echo " - Using GitHub token for authentication"
    CURL_OPTS+=(-H "Authorization: Bearer $SCIENCE_CORPORATION_SYNAPSE_TOKEN")
fi

echo " - Fetching synapse-api submodule info..."
CURL_RESULT=$(curl -s "${CURL_OPTS[@]}" "https://api.github.com/repos/sciencecorp/synapse-typescript/contents/synapse-api?ref=$REF_LIB")
if [ -z "$CURL_RESULT" ]; then
    echo "   - Failed to fetch from GitHub API"
    exit 1
fi

echo "   - Parsing SHA from response..."
GREP_RESULT=$(echo "$CURL_RESULT" | grep -o '"sha":\s*"[^"]*"')
if [ -z "$GREP_RESULT" ]; then
    echo "   - Failed to find SHA in API response"
    echo "   - API response: $CURL_RESULT"
    exit 1
fi

REF_API=$(echo "${GREP_RESULT#*:}" | tr -d '[:space:]"')
if [ -z "$REF_API" ]; then
    echo "   - Failed to parse SHA from API response"
    echo "   - API response: $CURL_RESULT"
    exit 1
fi

echo "- Found synapse-api ref \"$REF_API\""

# Create temp directory in a cross-platform way
if [ "$IS_WINDOWS" = true ]; then
    TMP_DIR=$(mktemp -d 2>/dev/null || echo "temp_dir_$RANDOM")
    mkdir -p "$TMP_DIR"
else
    TMP_DIR=$(mktemp -d)
fi

# Download using curl or fallback to PowerShell on Windows if curl fails
if ! curl -s -L "https://github.com/sciencecorp/synapse-api/archive/${REF_API}.zip" -o "$TMP_DIR/synapse-api.zip"; then
    if [ "$IS_WINDOWS" = true ]; then
        echo " - Curl failed, attempting download with PowerShell..."
        powershell -Command "Invoke-WebRequest -Uri 'https://github.com/sciencecorp/synapse-api/archive/${REF_API}.zip' -OutFile '$TMP_DIR/synapse-api.zip'"
    else
        echo " - Failed to download synapse-api"
        exit 1
    fi
fi

# Unzip in a cross-platform way
if [ "$IS_WINDOWS" = true ]; then
    if ! unzip -q "$TMP_DIR/synapse-api.zip" -d "$TMP_DIR" 2>/dev/null; then
        echo " - Unzip failed, attempting with PowerShell..."
        powershell -Command "Expand-Archive -Path '$TMP_DIR/synapse-api.zip' -DestinationPath '$TMP_DIR' -Force"
    fi
else
    if ! unzip -q "$TMP_DIR/synapse-api.zip" -d "$TMP_DIR"; then
        echo " - Failed to unzip synapse-api"
        exit 1
    fi
fi

# Create directory and copy files in a cross-platform way
mkdir -p synapse-api
if [ "$IS_WINDOWS" = true ]; then
    # Convert forward slashes to backslashes for Windows paths
    TMP_DIR_WIN=$(echo "$TMP_DIR" | sed 's/\//\\/g')
    powershell -Command "Copy-Item -Path \"$TMP_DIR_WIN\\synapse-api-${REF_API}\\*\" -Destination \"synapse-api\\\" -Recurse -Force"
else
    cp -r "$TMP_DIR/synapse-api-${REF_API}/"* synapse-api/
fi

# Clean up temp files
rm -rf "$TMP_DIR"

if [ ! -f "synapse-api/README.md" ] || [ ! -f "synapse-api/COPYRIGHT" ] || [ ! -d "synapse-api/api" ]; then
    echo " - Failed to download synapse-api - missing required files"
    exit 1
fi
echo " - Successfully downloaded synapse-api ref \"$REF_API\""
