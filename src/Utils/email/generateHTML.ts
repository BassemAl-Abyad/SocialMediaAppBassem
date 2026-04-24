export const template = (code: string, firstName: string, subject: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Verification Code</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f4f4f7;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #51545e;
            -webkit-text-size-adjust: none;
        }
        table {
            border-spacing: 0;
        }
        td {
            padding: 0;
        }
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f4f4f7;
            padding: 20px 0 40px 0;
        }
        .main-content {
            width: 100%;
            max-width: 600px;
            background-color: #ffffff;
            margin: 0 auto;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 3px rgba(0,0,0,0.1);
        }
        .otp-container {
            background-color: #f4f4f7;
            border-radius: 4px;
            padding: 20px;
            margin: 30px 0;
            text-align: center;
        }
        .otp-code {
            font-size: 32px;
            font-family: 'Courier New', Courier, monospace;
            font-weight: bold;
            letter-spacing: 6px;
            color: #3869d4;
            margin: 0;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #a8aaaf;
            padding: 25px;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <table class="main-content" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
                <td style="padding: 25px; text-align: center; background-color: #ffffff;">
                    <h1 style="margin: 0; color: #333333; font-size: 24px;">Bassem's Social Media App</h1>
                </td>
            </tr>
            
            <tr>
                <td style="padding: 25px;">
                    <h2 style="margin-top: 0; color: #333333; font-size: 19px; font-weight: bold;">${subject}</h2>
                    <p style="margin-top: 10px; line-height: 1.5;">Hi ${firstName},</p>
                    <p style="line-height: 1.5;">Thanks for signing up! Please use the following one-time password (OTP) to verify your email address. This code is valid for the next 5 minutes:</p>
                    
                    <div class="otp-container">
                        <p class="otp-code">${code}</p>
                    </div>
                    
                    <p style="line-height: 1.5;">If you did not request this code, you can safely ignore this email.</p>
                    <p style="line-height: 1.5;">Cheers,<br>The Social Media App Team</p>
                </td>
            </tr>
        </table>
        
        <div class="footer">
            <p>&copy; 2026 Sara7a App by Bassem Inc. | 123 Business Way, City, State</p>
        </div>
    </div>
</body>
</html>`;