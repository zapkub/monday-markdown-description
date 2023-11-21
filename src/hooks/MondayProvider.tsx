import React, { useMemo } from 'react'
import Monday from 'monday-sdk-js';
import { MondayClientSdk } from 'monday-sdk-js/types/client-sdk.interface';


type MondayProviderContextValue = { m: MondayClientSdk | null; ready: boolean }
const MondayProviderContext = React.createContext<MondayProviderContextValue>({ m: null, ready: false })

export const MondayProvider = ({ children }: { children: React.ReactNode }) => {
    const [m, setM] = React.useState<MondayClientSdk | null>(null)
    React.useEffect(() => {
        const m = Monday();
        setM(m)
    }, [])

    const contextValue = useMemo<MondayProviderContextValue>(() => ({
        m,
        ready: m !== null,
    }), [m])


    return (
        <MondayProviderContext.Provider value={contextValue}>
            {contextValue.ready ? children : 'monday is loading...'}
        </MondayProviderContext.Provider>
    )
}
export function useMondayClient() {

    const contextValue = React.useContext(MondayProviderContext)
    if(contextValue.m === null) {
        throw new Error('monday instance is not load properly')
    }

    return contextValue;
}

