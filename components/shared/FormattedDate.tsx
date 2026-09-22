import { format, parseISO } from "date-fns";

interface FormattedDateProps {
  dateString: string;
}

export function FormattedDate({ dateString }: FormattedDateProps) {
  const date = parseISO(dateString);

  return <time dateTime={dateString}>{format(date, "PPP p")}</time>;
}
