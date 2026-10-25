import type { ChangeEvent } from "react";

interface IProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Поле-ловушка для спам-ботов: убрано за пределы экрана и из порядка фокуса,
 * поэтому человек его не заполняет. Сервер молча отбрасывает заявки, где оно не пустое.
 */
export const HoneypotField = ({ value, onChange }: IProps) => (
  <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
    <label>
      Сайт
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={onChange}
      />
    </label>
  </div>
);
