import { google } from 'googleapis';
import { env } from '../config/env';

const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: env.GOOGLE_REFRESH_TOKEN });

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

interface CreateMeetingInput {
  summary: string;
  description: string;
  attendeeEmail: string;
  preferredDate: Date;
  preferredTime: string; // e.g. "3:00 PM"
  durationMinutes?: number;
}

// Parses "3:00 PM" style strings and combines with a date into a real Date object
function combineDateAndTime(date: Date, timeStr: string): Date {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  const result = new Date(date);

  if (!match) {
    result.setHours(10, 0, 0, 0); // fallback: 10 AM if time can't be parsed
    return result;
  }

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  result.setHours(hours, minutes, 0, 0);
  return result;
}

export const calendarService = {
  async createMeetingWithLink(input: CreateMeetingInput) {
    const startTime = combineDateAndTime(input.preferredDate, input.preferredTime);
    const endTime = new Date(startTime.getTime() + (input.durationMinutes ?? 30) * 60000);

    const response = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: {
        summary: input.summary,
        description: input.description,
        start: { dateTime: startTime.toISOString() },
        end: { dateTime: endTime.toISOString() },
        attendees: [{ email: input.attendeeEmail }],
        conferenceData: {
          createRequest: {
            requestId: `dnh-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' }
          }
        }
      }
    });

    const meetLink = response.data.hangoutLink;
    const eventId = response.data.id;

    if (!meetLink) {
      throw new Error('Google Meet link was not generated');
    }

    return { meetLink, eventId, eventLink: response.data.htmlLink };
  }
};