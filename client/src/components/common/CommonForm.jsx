import React from "react";
import { Form, Row, Col } from "antd";
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
  formInstance,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (formInstance) {
      formInstance(form);
    }
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [form, initialValues, formInstance]);

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

  const horizontalLabelCol = { span: 6 };
  const horizontalWrapperCol = { span: 18 };

  // ---------------------------
  // HÀM RENDER FIELD
  // ---------------------------
   const renderField = (field) => {
     // Xác định valuePropName dựa trên type
     let valuePropName = "value";
     let getValueProps, getValueFromEvent;

     if (field.type === "upload") {
       valuePropName = "fileList";
       getValueFromEvent = (e) => {
         if (Array.isArray(e)) {
           return e;
         }
         return e && e.fileList;
       };
     }

     if (field.type === "rate") {
       valuePropName = "value";
     }

     // --- NEW: group layout ---
     if (field.type === "group") {
       return (
         <Col span={24} key={field.label || Math.random()}>
           {field.label && (
             <div className="font-semibold mb-2">{field.label}</div>
           )}
           <div className={field.className || "flex gap-4"}>
             {field.fields.map((sub, idx) => (
               <div key={sub.name + idx} className="flex-1">
                 <Form.Item
                   label={sub.label}
                   name={sub.name.split(".")}
                   rules={sub.rules || []}
                   help={sub.helpText}
                   labelAlign="right"
                 >
                   {sub.customComponent || (
                     <CommonInput
                       prefixIcon={sub.prefixIcon}
                       suffixIcon={sub.suffixIcon}
                       className={sub.className}
                       placeholder={sub.placeholder}
                       type={sub.type}
                       size={sub.size}
                       variant={sub.variant}
                       allowClear={sub.allowClear}
                       disabled={sub.disabled}
                       {...sub.inputProps}
                     />
                   )}
                 </Form.Item>
               </div>
             ))}
           </div>
         </Col>
       );
     }

     // --- default: field dạng cũ ---
     return (
       <Col
         span={field.span || 24}
         key={field.name}
         className={field.colClassName}
       >
         <Form.Item
           label={field.label}
           name={field.name}
           rules={field.rules || []}
           className={field.itemClassName}
           help={field.helpText}
           labelAlign="right"
           valuePropName={valuePropName}
           getValueFromEvent={getValueFromEvent}
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
       </Col>
     );
   };

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
      <Row gutter={16}>{fields.map((field) => renderField(field))}</Row>

      {(submitButtonText || cancelButtonText) && (
        <Form.Item
          wrapperCol={
            layout === "horizontal" ? { offset: 6, span: 18 } : undefined
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
