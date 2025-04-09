import React, { useCallback } from "react"
import classNames from "classnames"
import { InputCheckboxComponent } from "./types"

export const InputCheckbox: InputCheckboxComponent = React.memo(({ id, checked = false, disabled, onChange }) => {
  // Callback for handling the change, ensuring we don't recreate the function on each render
  const handleChange = useCallback(() => {
    onChange(!checked)
  }, [checked, onChange])

  return (
    <div className="RampInputCheckbox--container" data-testid={`RampInputCheckbox-${id}`}>
      <label
        className={classNames("RampInputCheckbox--label", {
          "RampInputCheckbox--label-checked": checked,
          "RampInputCheckbox--label-disabled": disabled,
        })}
        htmlFor={`RampInputCheckbox-${id}`} // Associate label with input
      />
      <input
        id={`RampInputCheckbox-${id}`}
        type="checkbox"
        className="RampInputCheckbox--input"
        checked={checked}
        disabled={disabled}
        onChange={handleChange} // Use memoized change handler
      />
    </div>
  )
})
