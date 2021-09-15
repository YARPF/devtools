# devtools
Development utility for the framework

---
### You need to add this lines in your cfg file for allow auto-restart
```bash
add_ace resource.devtools command.ensure allow
add_ace resource.devtools command.start allow
add_ace resource.devtools command.stop allow
```

---

### Only for your development server! Never should be activated on a production server.

> Must be used with **daemon** and other YARPF resources utilities.