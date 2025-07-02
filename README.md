# Client

cd "client"
npm i
npm run dev

# Api
 cd "api"
 
 npm i 
 npx prisma generate
 
 npx prisma db push --preview-feature

 npx prisma db push --force-reset

 npm run dev


 # socket.io
 cd "socket"
  npm i 
