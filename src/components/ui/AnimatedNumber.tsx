import CountUp, { CountUpProps } from "react-countup";
import Typography, { TypographyProps } from "@mui/material/Typography";

type AnimatedNumberProps = TypographyProps &
  Omit<CountUpProps, "end"> & {
    end: number;
  };

export default function AnimatedNumber({
  end,
  start = 0,
  duration = 3,
  component = "span",
  ...props
}: AnimatedNumberProps) {
  const {
    variant,
    sx,
    className,
    ...countUpProps
  } = props;

  return (
    <Typography
      component={component}
      variant={variant}
      sx={sx}
      className={className}
    >
      <CountUp
        start={start}
        end={end}
        duration={duration}
        {...countUpProps}
      />
    </Typography>
  );
}