import {
  IPropertyPaneCustomFieldProps,
  IPropertyPaneField,
  PropertyPaneFieldType
} from '@microsoft/sp-property-pane';

/** SPFx 1.23 public typings omit PropertyPaneCustomField; mirror the platform helper. */
export function createPropertyPaneCustomField(
  properties: IPropertyPaneCustomFieldProps
): IPropertyPaneField<IPropertyPaneCustomFieldProps> {
  return {
    type: PropertyPaneFieldType.Custom,
    targetProperty: '',
    properties
  };
}
