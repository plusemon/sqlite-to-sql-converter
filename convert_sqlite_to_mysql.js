import fs from 'fs';

// File paths
const sqliteFile = 'input.sqlite.sql';
const mysqlFile = 'output.mysql.sql';

fs.readFile(sqliteFile, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading SQLite file:', err);
        return;
    }

    let mysqlData = data;

    // Remove BEGIN TRANSACTION and COMMIT as they are not needed in MySQL
    mysqlData = mysqlData.replace(/BEGIN TRANSACTION;\s*/g, '');
    mysqlData = mysqlData.replace(/COMMIT;\s*/g, '');

    // Replace double quotes with backticks for MySQL
    mysqlData = mysqlData.replace(/\"/g, '`');

    // Convert AUTOINCREMENT to AUTO_INCREMENT
    mysqlData = mysqlData.replace(/AUTOINCREMENT/g, 'AUTO_INCREMENT');

    // Convert INTEGER to INT
    mysqlData = mysqlData.replace(/\bINTEGER\b/g, 'INT');

    // Ensure VARCHAR fields have length specification
    mysqlData = mysqlData.replace(/VARCHAR\s*\(\s*\)/g, 'VARCHAR(255)');
    mysqlData = mysqlData.replace(/VARCHAR\b(?!\()/g, 'VARCHAR(255)');

    // Convert NUMERIC to DECIMAL
    mysqlData = mysqlData.replace(/\bNUMERIC\b/g, 'DECIMAL');

    // Handle TEXT type
    mysqlData = mysqlData.replace(/\bTEXT\b/g, 'TEXT');

    // Handle default values for non-numeric fields
    mysqlData = mysqlData.replace(/DEFAULT\s*'([0-9]+(\.[0-9]+)?)'/g, 'DEFAULT $1');
    mysqlData = mysqlData.replace(/DEFAULT\s*'(.*?)'/g, 'DEFAULT \'$1\'');

    // Ensure proper formatting of PRIMARY KEY and FOREIGN KEY constraints
    mysqlData = mysqlData.replace(/PRIMARY KEY\s*\((.*?)\)/g, 'PRIMARY KEY ($1)');
    mysqlData = mysqlData.replace(/FOREIGN KEY\s*\((.*?)\)\s*REFERENCES\s*(.*?)\s*\((.*?)\)\s*ON DELETE\s*(.*)/g, 'FOREIGN KEY ($1) REFERENCES $2($3) ON DELETE $4');

    // Adjust TINYINT and other specific cases
    mysqlData = mysqlData.replace(/TINYINT\(1\)/g, 'TINYINT(1)');

    // Correct case sensitivity issues for MySQL
    mysqlData = mysqlData.replace(/(\bPRIMARY KEY\s*\(\s*\w+\s*\)\s*)/gi, match => match.toUpperCase());
    mysqlData = mysqlData.replace(/(\bFOREIGN KEY\s*\(\s*\w+\s*\)\s*REFERENCES\s*\w+\s*\(\s*\w+\s*\)\s*ON DELETE\s*\w+)/gi, match => match.toUpperCase());

    // Write the MySQL SQL file
    fs.writeFile(mysqlFile, mysqlData, 'utf8', (err) => {
        if (err) {
            console.error('Error writing MySQL file:', err);
            return;
        }
        console.log('Conversion completed successfully.');
    });
});
