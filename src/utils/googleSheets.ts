import { google } from 'googleapis';

interface RegistrationData {
  timestamp: string;
  fullName: string;
  department: string;
  activity: string;
  imageUrl: string;
}

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const SPREADSHEET_ID = '17YFQj2csFQZauPDg9j3s5LpKJqGquFzV3yLNgFZ4doI';
const RANGE = 'Form Responses 1!A2:F';

function convertGoogleDriveLink(url: string): string {
  try {
    // Check if it's a Google Drive link
    if (url.includes('drive.google.com')) {
      // Extract the file ID
      const fileId = url.match(/[-\w]{25,}/);
      if (fileId) {
        // Convert to direct download link
        return `https://drive.google.com/uc?export=view&id=${fileId[0]}`;
      }
    }
    return url;
  } catch (error) {
    console.error('Error converting Google Drive link:', error);
    return url;
  }
}

async function validateSpreadsheetAccess(sheets: any, spreadsheetId: string) {
  try {
    // Try to get spreadsheet metadata first
    const response = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
    });
    console.log('Successfully validated spreadsheet access');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Spreadsheet access validation failed:', error.message);
      const apiError = error as { code?: number; message?: string };
      if (apiError.code === 403) {
        throw new Error(`Access denied to spreadsheet. Please ensure the service account (${process.env.GOOGLE_SHEETS_CLIENT_EMAIL}) has been granted access to the spreadsheet.`);
      } else if (apiError.code === 404) {
        throw new Error(`Spreadsheet not found. Please verify the spreadsheet ID: ${spreadsheetId}`);
      }
    }
    throw error;
  }
}

async function getAuthClient() {
  try {
    if (!process.env.GOOGLE_SHEETS_CLIENT_EMAIL || !process.env.GOOGLE_SHEETS_PRIVATE_KEY) {
      throw new Error('Missing required environment variables for Google Sheets authentication');
    }

    console.log('Initializing Google Sheets authentication...');
    console.log('Using service account:', process.env.GOOGLE_SHEETS_CLIENT_EMAIL);
    
    // Clean up private key - ensure proper line breaks and remove quotes
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY
      .replace(/\\n/g, '\n')
      .replace(/"$/, '')
      .replace(/^"/, '');
    
    const auth = new google.auth.GoogleAuth({
      scopes: SCOPES,
      credentials: {
        type: 'service_account',
        project_id: 'extended-optics-461808-e5',
        private_key: privateKey,
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      },
    });

    // Test the authentication
    const client = await auth.getClient();
    console.log('Successfully authenticated with Google Sheets API');
    
    return auth;
  } catch (error) {
    console.error('Error creating auth client:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw new Error(`Failed to initialize Google Sheets authentication: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getRegistrationData(): Promise<RegistrationData[]> {
  try {
    console.log('Starting registration data fetch...');
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });

    // Validate spreadsheet access before attempting to read data
    await validateSpreadsheetAccess(sheets, SPREADSHEET_ID);

    console.log(`Attempting to fetch data from spreadsheet ${SPREADSHEET_ID}...`);
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found in spreadsheet');
      return [];
    }

    console.log(`Successfully fetched ${rows.length} rows from spreadsheet`);
    return rows.map((row) => ({
      timestamp: row[0] || '',
      fullName: row[1] || '',
      department: row[2] || '',
      activity: row[3] || '',
      imageUrl: convertGoogleDriveLink(row[4] || ''),
    })).filter(data => data.fullName); // Only return rows with names

  } catch (error) {
    console.error('Error fetching registration data:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    // Re-throw the error with the original message if it's already a custom error
    if (error instanceof Error && (
      error.message.includes('Access denied') || 
      error.message.includes('Spreadsheet not found')
    )) {
      throw error;
    }
    throw new Error(`Failed to fetch registration data from Google Sheets: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 