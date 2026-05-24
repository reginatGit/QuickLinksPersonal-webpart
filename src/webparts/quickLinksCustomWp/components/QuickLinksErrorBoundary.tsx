import * as React from 'react';

interface IQuickLinksErrorBoundaryProps {
  children?: React.ReactNode;
}

interface IQuickLinksErrorBoundaryState {
  hasError: boolean;
  message?: string;
}

export default class QuickLinksErrorBoundary extends React.Component<
  IQuickLinksErrorBoundaryProps,
  IQuickLinksErrorBoundaryState
> {
  public constructor(props: IQuickLinksErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): IQuickLinksErrorBoundaryState {
    return { hasError: true, message: error?.message };
  }

  public componentDidCatch(error: Error): void {
    console.error('Quick Links web part render error', error);
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '12px', color: '#a80000', backgroundColor: '#fde7e9', borderRadius: '4px' }}>
          <strong>Quick Links could not load.</strong>
          {this.state.message ? <p style={{ margin: '8px 0 0' }}>{this.state.message}</p> : null}
          <p style={{ margin: '8px 0 0', fontSize: '13px' }}>
            Open the browser console (F12) for details, or remove and re-add the web part.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
