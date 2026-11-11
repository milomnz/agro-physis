import type {ReactNode} from 'react';
import {ScrollView} from 'react-native';

interface CenteredScrollProps {
    children: ReactNode;
    className?: string;
    contentClassName?: string;
}
/**
 * Contenido centrado que se vuelve desplazable cuando no cabe en pantalla.
*/

export default function CenteredScroll({
    children,
    className = '',
    contentClassName = '',
}: CenteredScrollProps) {
    return (
        <ScrollView
            className={`flex-1 ${className}`}
            contentContainerClassName={contentClassName}
            contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}
            keyboardShouldPersistTaps="handled"
        >
            {children}
        </ScrollView>
    );
}