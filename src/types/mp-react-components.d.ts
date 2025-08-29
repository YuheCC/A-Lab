declare module '@materialsproject/mp-react-components' {
    import { ReactNode } from 'react';

    export type MaterialsInputType = 'elements' | 'chemical_system' | 'formula' | 'mpid' | 'smiles' | 'text' | 'molecule_formula';

    export type PeriodicTableMode = 'toggle' | 'focus' | 'none';

    export interface HelpItem {
        label: string;
        examples?: string[];
    }

    export interface MaterialsInputProps {
        value?: string;
        onChange?: (value: string) => void;
        placeholder?: string;
        label?: string;
        allowedInputTypes?: MaterialsInputType[];
        periodicTableMode?: PeriodicTableMode;
        showTypeDropdown?: boolean;
        showSubmitButton?: boolean;
        helpItems?: HelpItem[];
        className?: string;
        style?: React.CSSProperties;
        children?: ReactNode;
    }

    export const MaterialsInput: React.FC<MaterialsInputProps>;
}
