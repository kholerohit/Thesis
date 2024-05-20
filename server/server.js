const express = require('express');
const bodyParser = require('body-parser');
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const app = express();
const port = 3001;
const cors = require('cors'); // Import the cors middleware

app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from this origin
    credentials: true, // If you're using cookies or authorization headers
  }));
  
  
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(express.json()); // Middleware to parse JSON request bodies

// Directory for temporary ZoKrates code
const tempDir = path.join(os.tmpdir(), 'zokrates');

// Create temporary directory if it doesn't exist
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

app.get('/', (req, res) => {
    res.send('Welcome to the backend server');
  });

  const { exec } = require('child_process');

  // Step 1: Endpoint for compiling ZoKrates code
  app.post('/api/compile-zokrates', (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({ success: false, error: 'Code is required' });
      }
    const zokFilePath = path.join(tempDir, 'code.zok');
    fs.stat(tempDir, (err, stats) => {
        if (err) {
          console.error('Error accessing directory:', err);
          return;
        }
      
        console.log('Directory permissions:', stats.mode.toString(8)); // Convert permissions to octal representation
    });
      // Save ZoKrates code to a file
  try {
    fs.writeFileSync(zokFilePath, code);
  } catch (writeError) {
    return res.status(500).json({ success: false, error: 'Failed to write ZoKrates code to file', writeError });
  }
  
  // Compile ZoKrates code with stdlib path
  const stdlibPath = 'C:\\Users\\anany\\zokrates\\zokrates_stdlib\\stdlib';
  exec(`zokrates compile -i ${zokFilePath} --stdlib-path ${stdlibPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      res.status(500).json({ success: false, error: 'Failed to compile ZoKrates code', stderr });
      return;
    }
      if (stderr) {
        console.error(`Error: ${stderr}`);
        res.status(500).json({ success: false, error: 'Failed to compile ZoKrates code', stderr });
        return;
      }
      console.log('Compilation successful');
      res.json({ success: true, output: stdout });
    });
  });
  

// Step 2: Endpoint for running setup phase
app.get('/api/run-setup', (req, res) => {
  try {
    // Run setup phase
    execSync('zokrates setup');
    res.json({ success: true, message: 'Setup phase completed successfully' });
  } catch (error) {
    console.error(`Error: ${error}`);
    res.status(500).json({ success: false, error: 'Failed to run setup phase' });
  }
});

// Step 3: Endpoint for exporting verifier
app.get('/api/export-verifier', (req, res) => {
  try {
    // Export verifier
    execSync('zokrates export-verifier');
    res.json({ success: true, message: 'Verifier exported successfully' });
  } catch (error) {
    console.error(`Error: ${error}`);
    res.status(500).json({ success: false, error: 'Failed to export verifier' });
  }
});

// Step 1: Endpoint for generating proof
app.post('/api/generate-proof', async (req, res) => {
  const { certificatehash, certificatehash1, certificatehash2, certificatehash3, myaddress, myage, mydegree, aadharNumber, mypercentage,  myfamilyincome, mycaste, mynationality, degree, caste, nationality, minimum_percentage, maximum_age, minimum_age, maximum_familyincome } = req.body;
  console.log(req.body)
  try {

    // Run ZoKrates commands to generate proof
    execSync(`zokrates compute-witness -a ${certificatehash} ${certificatehash1} ${certificatehash2} ${certificatehash3} ${myaddress} ${myage} ${mydegree} ${aadharNumber} ${mypercentage}  ${myfamilyincome} ${mycaste} ${mynationality} ${degree} ${caste} ${nationality} ${minimum_percentage} ${maximum_age} ${minimum_age} ${maximum_familyincome}`);
    execSync('zokrates generate-proof');

    // Read proof from file
    const proof = fs.readFileSync('proof.json', 'utf8');
    res.json({ success: true, proof });
  } catch (error) {
    console.error(`Error: ${error}`);
    res.status(500).json({ success: false, error: 'Failed to generate proof' });
  }
});


app.post('/api/verify-proof', (req, res) => {
  const { proof } = req.body; // Assuming proof is the key containing the JSON string

  try {
    const proofData = JSON.parse(proof); // Parsing the JSON string back to an object
    // Now you can access proofData.a, proofData.b, proofData.c, etc.

    // Your verification logic here...

    // Respond with success message
    res.status(200).json({ success: true, message: 'Proof received and processed successfully' });
  } catch (error) {
    console.error('Error processing proof:', error);
    // Respond with error message
    res.status(500).json({ success: false, error: 'Failed to process proof' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
