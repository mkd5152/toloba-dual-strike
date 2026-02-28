/**
 * Microsoft Teams Webhook Integration
 * Sends error notifications to Teams channel
 */

const TEAMS_WEBHOOK_URL = process.env.NEXT_PUBLIC_TEAMS_WEBHOOK_URL || "https://publicisgroupe.webhook.office.com/webhookb2/099eb686-e93c-4447-bb57-3bbd38e4442b@d52c9ea1-7c21-47b1-82a3-33a74b1f74b8/IncomingWebhook/c0898bbe12f04aa8877927a5a812ca9d/d4873267-cd3a-4373-9b12-c36e12eebf1f/V2HClZQ0WFZ1jbmzd5QmnSFHJoBDiRxZTboScDePC5AgU1";

interface ErrorContext {
  operation: string;
  matchId: string;
  inningsId?: string;
  overId?: string;
  error: Error;
  additionalData?: any;
}

/**
 * Send error notification to MS Teams channel
 */
export async function sendTeamsErrorNotification(context: ErrorContext): Promise<void> {
  if (!TEAMS_WEBHOOK_URL) {
    console.warn('Teams webhook URL not configured');
    return;
  }

  try {
    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Dubai',
      dateStyle: 'medium',
      timeStyle: 'medium'
    });

    const errorMessage = context.error.message || 'Unknown error';
    const stackTrace = context.error.stack || 'No stack trace available';

    // Format message for Teams
    const card = {
      "@type": "MessageCard",
      "@context": "https://schema.org/extensions",
      "themeColor": "FF0000",
      "title": `🚨 Database Error: ${context.operation}`,
      "summary": `Error in ${context.operation}`,
      "sections": [
        {
          "activityTitle": "Dual Strike Scoring System",
          "activitySubtitle": timestamp,
          "facts": [
            {
              "name": "Operation",
              "value": context.operation
            },
            {
              "name": "Match ID",
              "value": context.matchId
            },
            ...(context.inningsId ? [{
              "name": "Innings ID",
              "value": context.inningsId
            }] : []),
            ...(context.overId ? [{
              "name": "Over ID",
              "value": context.overId
            }] : []),
            {
              "name": "Error Message",
              "value": errorMessage
            },
          ],
          "markdown": true
        },
        {
          "title": "Stack Trace",
          "text": `\`\`\`\n${stackTrace.substring(0, 1000)}\n\`\`\``
        },
        ...(context.additionalData ? [{
          "title": "Additional Data",
          "text": `\`\`\`json\n${JSON.stringify(context.additionalData, null, 2).substring(0, 1000)}\n\`\`\``
        }] : [])
      ]
    };

    // Send async, don't block the UI
    fetch(TEAMS_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(card),
    }).catch(err => {
      // Silently fail - don't let webhook errors affect scoring
      console.error('Failed to send Teams notification:', err);
    });

  } catch (err) {
    console.error('Error formatting Teams message:', err);
  }
}
