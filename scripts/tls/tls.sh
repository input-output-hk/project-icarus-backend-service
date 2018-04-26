# Create CA key and cert
openssl genrsa -out server_rootCA.key 2048
openssl req -x509 -new -nodes -key server_rootCA.key -sha256 -days 3650 -out server_rootCA.pem

# Create server key
openssl req -new -sha256 -nodes -out server.csr -newkey rsa:2048 -keyout server.key -config <( cat server_rootCA.csr.cnf )

# Create server cert
openssl x509 -req -in server.csr -CA server_rootCA.pem -CAkey server_rootCA.key -CAcreateserial -out server.crt -days 3650 -sha256 -extfile v3.ext

cp server_rootCA.pem ../../tls-files/develop/ca.pem
cp server.crt ../../tls-files/develop/server.crt 
cp server.key  ../../tls-files/develop/server.key