#!/bin/bash

download_submodule() {
    local submodule_dir="$1"
    local submodule_name=$(basename "$submodule_dir")
    local repo_name="sciencecorp/$submodule_name"
    
    echo "Postinstall - downloading $submodule_name"

    # If directory already exists, skip download
    if [ -d "$submodule_dir" ]; then
        echo " - $submodule_dir directory already exists, skipping download"
        return 0
    fi

    # If we have git, try to update the submodule
    HAS_GIT=false
    if command -v git >/dev/null 2>&1 && git rev-parse --git-dir >/dev/null 2>&1; then
        HAS_GIT=true
        echo " - Git detected, attempting to update submodule..."

        if git submodule update --init "$submodule_dir"; then
            echo " - Successfully updated $submodule_dir submodule"
            return 0
        else
            echo " - Failed to update submodule, falling back to download..."
        fi
    fi

    # Else, fallback to downloading from github
    echo "Downloading $submodule_name..."

    if [ "$HAS_GIT" = true ]; then
        REF_LIB=$(git rev-parse HEAD)
    else
        REF_LIB=$(node -p "require('./package.json').version")
        if [ -z "$REF_LIB" ]; then
            echo " - Failed to get version from package.json"
            return 1
        fi
        REF_LIB=v$REF_LIB
    fi

    echo "- Looking up $submodule_name ref for synapse-typescript ref $REF_LIB"

    CURL_OPTS=()
    CURL_OPTS+=(-H "Accept: application/vnd.github+json")
    CURL_OPTS+=(-H "X-GitHub-Api-Version: 2022-11-28")
    if [ -n "$SCIENCE_CORPORATION_SYNAPSE_TOKEN" ]; then
        echo " - Using GitHub token for authentication"
        CURL_OPTS+=(-H "Authorization: Bearer $SCIENCE_CORPORATION_SYNAPSE_TOKEN")
    fi

    echo " - Fetching $submodule_name submodule info..."
    CURL_RESULT=$(curl -s "${CURL_OPTS[@]}" "https://api.github.com/repos/sciencecorp/synapse-typescript/contents/$submodule_dir?ref=$REF_LIB")
    if [ -z "$CURL_RESULT" ]; then
        echo "   - Failed to fetch from GitHub API"
        return 1
    fi

    echo "   - Parsing SHA from response..."
    GREP_RESULT=$(echo "$CURL_RESULT" | grep -o '"sha":\s*"[^"]*"')
    if [ -z "$GREP_RESULT" ]; then
        echo "   - Failed to find SHA in API response"
        echo "   - API response: $CURL_RESULT"
        return 1
    fi

    REF_API=$(echo "${GREP_RESULT#*:}" | tr -d '[:space:]"')
    if [ -z "$REF_API" ]; then
        echo "   - Failed to parse SHA from API response"
        echo "   - API response: $CURL_RESULT"
        return 1
    fi

    echo "- Found $submodule_name ref \"$REF_API\""

    TMP_DIR=$(mktemp -d)
    if ! curl -s -L "https://github.com/$repo_name/archive/${REF_API}.zip" -o "$TMP_DIR/$submodule_name.zip"; then
        echo " - Failed to download $submodule_name"
        return 1
    fi

    if ! unzip -q "$TMP_DIR/$submodule_name.zip" -d "$TMP_DIR"; then
        echo " - Failed to unzip $submodule_name"
        return 1
    fi

    mkdir -p "$submodule_dir"
    cp -r "$TMP_DIR/$submodule_name-${REF_API}/"* "$submodule_dir/"

    rm "$TMP_DIR/$submodule_name.zip"

    if [ ! -f "$submodule_dir/README.md" ] || [ ! -f "$api_dir/COPYRIGHT" ] || [ ! -d "$api_dir/api" ]; then
        echo " - Failed to download $submodule_name - missing required files"
        return 1
    fi
    echo " - Successfully downloaded $submodule_name ref \"$REF_API\""
}

# Call the function with the desired directory
download_submodule "synapse-api"
download_submodule "science-device-api"
