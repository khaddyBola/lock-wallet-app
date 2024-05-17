import { createContext, useState } from "react"

const TimelockContext = createContext();

export const TimelockProvider = ({children}) => {
    const [isReload, setIsReload] = useState(false);

    return (
        <TimelockContext.Provider value={{isReload, setIsReload}}>
            {children}
        </TimelockContext.Provider>
    )
}

export default TimelockContext;