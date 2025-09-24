#!/usr/bin/env python3

import re

# Read the workflow file
with open('.github/workflows/ci.yml', 'r') as f:
    content = f.read()

# Pattern to match the current docker push command
pattern = r'jf docker push "\$IMAGE_NAME" \\\s*\n\s*--build-name "\$BUILD_NAME" \\\s*\n\s*--build-number "\$BUILD_NUMBER" \\\s*\n\s*--project "\$\{\{ vars\.PROJECT_KEY \}\}"'

# Replacement with conditional logic
replacement = '''# Try modern command first, fallback to deprecated command for older Artifactory versions
          echo "🚀 Attempting to push Docker image with build-info..."
          if jf docker push "$IMAGE_NAME" \\
            --build-name "$BUILD_NAME" \\
            --build-number "$BUILD_NUMBER" \\
            --project "${{ vars.PROJECT_KEY }}" 2>/dev/null; then
            echo "✅ Successfully pushed using modern jf docker push command"
          else
            echo "⚠️ Modern command failed (likely Artifactory < 7.33.3), using deprecated command..."
            REPO_KEY="${{ vars.PROJECT_KEY }}-$SERVICE_NAME-internal-docker-nonprod-local"
            jf rt docker-push "$IMAGE_NAME" "$REPO_KEY" \\
              --build-name "$BUILD_NAME" \\
              --build-number "$BUILD_NUMBER" \\
              --project "${{ vars.PROJECT_KEY }}"
            echo "✅ Successfully pushed using deprecated jf rt docker-push command"
          fi'''

# Apply the replacement
new_content = re.sub(pattern, replacement, content)

# Write back to file
with open('.github/workflows/ci.yml', 'w') as f:
    f.write(new_content)

print("Applied conditional docker push fix")
