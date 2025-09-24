// CommonForm.jsx - cần thêm phần này
import React from "react";
import { Form } from "antd";
import CommonInput from "./CommonInput";
import CommonButton from "./CommonButton";

const CommonForm = ({
  fields,
  onSubmit,
  submitButtonText = "Submit",
  submitButtonProps = {},
  cancelButtonText,
  onCancel,
  cancelButtonProps = {},
  loading = false,
  layout = "vertical",
  className = "",
  buttonLayout = "horizontal",
  initialValues = {},
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [form, initialValues]);

  const handleFinish = (values) => {
    onSubmit?.(values);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      form.resetFields();
    }
  };

  // Style cho layout horizontal
  const horizontalLabelCol = { span: 4 };
  const horizontalWrapperCol = { span: 20 };

  return (
    <Form
      form={form}
      layout={layout}
      labelCol={layout === "horizontal" ? horizontalLabelCol : undefined}
      wrapperCol={layout === "horizontal" ? horizontalWrapperCol : undefined}
      onFinish={handleFinish}
      initialValues={initialValues}
      className={`w-full ${className}`}
    >
      {fields.map((field) => (
        <Form.Item
          key={field.name}
          label={field.label}
          name={field.name}
          rules={field.rules || []}
          className={field.itemClassName}
          help={field.helpText}
          labelAlign="right"
        >
          {field.customComponent || (
            <CommonInput
              prefixIcon={field.prefixIcon}
              suffixIcon={field.suffixIcon}
              className={field.className}
              placeholder={field.placeholder}
              type={field.type}
              size={field.size}
              variant={field.variant}
              allowClear={field.allowClear}
              disabled={field.disabled}
              {...field.inputProps}
            />
          )}
        </Form.Item>
      ))}

      {(submitButtonText || cancelButtonText) && (
        <Form.Item
          wrapperCol={
            layout === "horizontal" ? { offset: 4, span: 20 } : undefined
          }
          className="w-full !mb-0"
        >
          <div
            className={`flex ${
              buttonLayout === "vertical"
                ? "flex-col gap-2"
                : "flex-row gap-3 justify-start"
            } w-full`}
          >
            {submitButtonText && (
              <CommonButton
                type="primary"
                htmlType="submit"
                loading={loading}
                className={`${submitButtonProps.className || ""}`}
                {...submitButtonProps}
              >
                {submitButtonText}
              </CommonButton>
            )}

            {cancelButtonText && (
              <CommonButton
                htmlType="button"
                onClick={handleCancel}
                disabled={loading}
                className={`border-gray-300 text-gray-700 hover:border-gray-400 ${
                  cancelButtonProps.className || ""
                }`}
                {...cancelButtonProps}
              >
                {cancelButtonText}
              </CommonButton>
            )}
          </div>
        </Form.Item>
      )}
    </Form>
  );
};

export default CommonForm;
