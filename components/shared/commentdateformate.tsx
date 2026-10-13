import { format, isValid, parseISO } from "date-fns";

interface CommentDateFormatProps {
  dateString: string;
  className?: string;
}

export default function CommentDateFormat({
  dateString,
  className,
}: CommentDateFormatProps) {
  const date = parseISO(dateString);

  if (!isValid(date)) {
    return <span className={className}>Invalid date</span>;
  }

  return (
    <time dateTime={dateString} className={className}>
      {format(date, "dd MMM yyyy, h:mm a")}
    </time>
  );
}
