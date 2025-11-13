const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

const formData = new FormData();
// Replace with your actual image path
formData.append('file', fs.createReadStream('C:\\Users\\HP\\Downloads\\act4_preact_hist.png'));

fetch('http://localhost:3000/users/me/image', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyIiwiaWF0IjoxNzYzMDYzMDAxLCJleHAiOjE3NjM2Njc4MDF9.k9xxiYrycgw_b5kHgYc1EZfF0-38lkzHO5quNZCG_LM',
    ...formData.getHeaders()
  },
  body: formData
})
.then(res => res.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
