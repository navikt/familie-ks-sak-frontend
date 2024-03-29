kubectl config use-context dev-gcp

function get_secrets() {
  local repo=$1
  kubectl -n teamfamilie get secret "${repo}" -o json | jq '.data | map_values(@base64d)'
}

LOKAL_SECRETS=$(get_secrets azuread-familie-ks-sak-frontend-lokal)

CLIENT_ID=$(echo "$LOKAL_SECRETS" | jq -r '.AZURE_APP_CLIENT_ID')
CLIENT_SECRET=$(echo "$LOKAL_SECRETS" | jq -r '.AZURE_APP_CLIENT_SECRET')

# Generate random 32 character strings for the cookie and session keys
COOKIE_KEY1=$(openssl rand -hex 16)
COOKIE_KEY2=$(openssl rand -hex 16)
SESSION_SECRET=$(openssl rand -hex 16)

if [ -z "$CLIENT_ID" ]
then
      echo "Klarte ikke å hente miljøvariabler. Er du pålogget Naisdevice og google cloud?"
      return 1
fi

# Write the variables into the .env file
cat << EOF > .env
# Denne filen er generert automatisk ved å kjøre \`hent-og-lagre-miljøvariabler.sh\`

COOKIE_KEY1='$COOKIE_KEY1'
COOKIE_KEY2='$COOKIE_KEY2'
SESSION_SECRET='$SESSION_SECRET'
DREK_URL='<any string eller en url for testing>'

CLIENT_ID='$CLIENT_ID'
CLIENT_SECRET='$CLIENT_SECRET'

APP_VERSION=0.0.1

# Ønsker du å kjøre mot lokal backend som ikke går mot preprod bruker du disse variablene
# KS_SAK_SCOPE=api://dev-gcp.teamfamilie.familie-ks-sak-lokal/.default
# ENV=local

# Ønsker du å kjøre mot lokal ks backend som går mot preprod bruker du disse variablene
# KS_SAK_SCOPE=api://dev-gcp.teamfamilie.familie-ks-sak/.default
# ENV=local

# Ønsker du å kjøre direkte mot preprod bruker du disse variablene
KS_SAK_SCOPE=api://dev-gcp.teamfamilie.familie-ks-sak/.default
ENV=lokalt-mot-preprod
EOF