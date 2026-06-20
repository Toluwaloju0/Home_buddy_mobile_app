// Run locally: mongosh "mongodb://localhost:27017/Home_Buddy" create_admin_user.js
use Home_Buddy;
db.admin.insertOne({
  email: "admin@example.com",
  password: "$argon2id$v=19$m=65536,t=3,p=4$YTURM5tkLyVUKp2Qs83HL6XrPjrWX/FoZ0D8OEBduK8B7PkN/FObVAPWBgzd6B5tqm0$Rqz4IIL7JiLRlLi8u+1SayfCYTpbjSf+cqKoaVMM0besgnIAc5TC8FdmtiGvgwXWKpE",
  name: "Admin User",
  role: "admin",
});