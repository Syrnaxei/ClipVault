curl -X POST http://localhost:3000/api/clipboards/by-uuid/f34c1924-d8cb-4f0d-888a-609033816872/items \
  -H "Authorization:Bearer ClipVault" \
  -H "Content-Type:application/json" \
  -d '{"content":"hello","device":"我的iPhone","device_type":"iPhone"}'