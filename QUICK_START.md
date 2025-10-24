# ⚡ Quick Start Guide

## 🎯 What You Need to Do Right Now

Your app is **fully built** and ready to run. You just need to initialize the database.

---

## 📦 1. Run These 3 Commands (In Terminal)

```bash
# Generate Prisma client (creates TypeScript types)
bunx prisma generate

# Sync schema to database (creates tables)
bunx prisma db push

# Add initial data (test accounts, exercises, foods)
bun run prisma/seed.ts
```

That's it! Database is ready.

---

## ✅ 2. Verify Setup (Optional)

```bash
# Check connection and see database stats
bun run verify-setup.ts
```

Expected output:
```
✅ Database connection successful
📊 Database Statistics:
   Users: 2
   Exercises: 15
   Foods: 12
   Program Offers: 3
   Goals: 2
```

---

## 🚀 3. Start Your App

Use your normal start command. The app will connect to the real database.

---

## 🧪 4. Test with These Accounts

### Coach Login
```
Email: coach@example.com
Password: password123
```

What you can do:
- View client dashboard
- Manage exercises and foods in CMS
- Generate AI plans for clients
- Chat with clients
- View alerts

### Client Login
```
Email: client@example.com  
Password: password123
```

What you can do:
- View daily tasks
- Complete workouts
- Track measurements
- Set goals
- Chat with coach
- View meal plans

---

## 🎉 What Works Right Now

✅ **Registration & Auth** - Creates real user accounts in DB  
✅ **Onboarding** - Saves data and extracts labels  
✅ **AI Plan Generation** - Uses CMS exercises/foods + client labels  
✅ **Task Tracking** - Real task completion and adherence calculation  
✅ **Goals** - Create, update, track progress  
✅ **Measurements** - Weight, body measurements with history  
✅ **Messaging** - Real-time chat with read status  
✅ **Alerts** - Auto-generated for low adherence, plateaus, etc.  
✅ **Questionnaires** - Initial + 30-day follow-ups  
✅ **Progress Analytics** - Charts, streaks, statistics  
✅ **CMS Library** - Manage exercises and foods  
✅ **Program Offers** - Subscription tiers  

---

## 📊 View Your Database (Optional)

```bash
bunx prisma studio
```

Opens visual database browser at http://localhost:5555

Browse all tables, view data, run queries.

---

## 🐛 Troubleshooting

### "Can't find module '@prisma/client'"
→ Run: `bunx prisma generate`

### "Table does not exist"  
→ Run: `bunx prisma db push`

### No users after seeding
→ Run: `bun run prisma/seed.ts` again

### TypeScript errors
→ Run: `bunx prisma generate` then restart TypeScript server

---

## 🎯 Next Steps After Setup

1. **Register a new client** → Test full onboarding flow
2. **Login as coach** → Generate AI plan for client
3. **Login as client** → Complete tasks, track progress
4. **Test messaging** → Chat between coach and client
5. **Check alerts** → System auto-generates them based on adherence

---

## 📚 More Documentation

- `INFRASTRUCTURE_COMPLETE.md` - Full system overview
- `DATABASE_SETUP_COMMANDS.md` - Detailed command reference
- `IMPLEMENTATION_COMPLETE.md` - Features checklist

---

## ⚡ TL;DR

```bash
bunx prisma generate && bunx prisma db push && bun run prisma/seed.ts
```

Done. Start your app and login with coach@example.com / password123
