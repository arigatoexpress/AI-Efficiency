import { failInput } from "./errors.mjs";

const UTC_TIMESTAMP =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?Z$/;
const CALENDAR_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function validUtcParts(match, milliseconds = 0) {
  const [, year, month, day, hour = "00", minute = "00", second = "00"] = match;
  const time = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
    milliseconds,
  );
  const date = new Date(time);
  return (
    Number.isFinite(time) &&
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() + 1 === Number(month) &&
    date.getUTCDate() === Number(day) &&
    date.getUTCHours() === Number(hour) &&
    date.getUTCMinutes() === Number(minute) &&
    date.getUTCSeconds() === Number(second) &&
    date.getUTCMilliseconds() === milliseconds
  );
}

export function utcMillis(value, fieldPath = "input") {
  if (typeof value !== "string") {
    failInput("SCHEMA_INVALID_TIMESTAMP", fieldPath);
  }
  const match = UTC_TIMESTAMP.exec(value);
  if (match === null) failInput("SCHEMA_INVALID_TIMESTAMP", fieldPath);
  const milliseconds = Number((match[7] ?? "").padEnd(3, "0"));
  if (!validUtcParts(match, milliseconds)) {
    failInput("SCHEMA_INVALID_TIMESTAMP", fieldPath);
  }
  return Date.parse(value);
}

export function assertCalendarDate(value, fieldPath = "input") {
  if (typeof value !== "string") failInput("SCHEMA_INVALID_DATE", fieldPath);
  const match = CALENDAR_DATE.exec(value);
  if (match === null || !validUtcParts(match)) {
    failInput("SCHEMA_INVALID_DATE", fieldPath);
  }
  return value;
}

export function assertEarlier(start, end, fieldPath = "input") {
  if (utcMillis(start, fieldPath) >= utcMillis(end, fieldPath)) {
    failInput("SCHEMA_INVALID_TIME_ORDER", fieldPath);
  }
}

export function assertAvailableAtSnapshot(
  availableAt,
  snapshotTime,
  fieldPath = "forecast.observations",
) {
  if (utcMillis(availableAt, fieldPath) > utcMillis(snapshotTime, "provenance")) {
    failInput("SCHEMA_FUTURE_INFORMATION", fieldPath);
  }
}
