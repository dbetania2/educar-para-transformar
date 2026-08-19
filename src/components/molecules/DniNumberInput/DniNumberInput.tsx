import { NumberInput, type NumberInputProps } from "@mantine/core";

const DNI_LENGTH = 8;

type DniNumberInputProps = Omit<
  NumberInputProps,
  | "allowDecimal"
  | "allowNegative"
  | "decimalScale"
  | "hideControls"
  | "isAllowed"
  | "thousandSeparator"
  | "trimLeadingZeroesOnBlur"
  | "type"
  | "valueIsNumericString"
>;

export function DniNumberInput(props: DniNumberInputProps) {
  return (
    <NumberInput
      {...props}
      allowDecimal={false}
      allowNegative={false}
      clampBehavior="none"
      decimalScale={0}
      hideControls
      inputMode="numeric"
      isAllowed={({ value }) => /^\d{0,8}$/.test(value)}
      maxLength={DNI_LENGTH}
      thousandSeparator={false}
      trimLeadingZeroesOnBlur={false}
      type="tel"
      valueIsNumericString
    />
  );
}

export default DniNumberInput;
