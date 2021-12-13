import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { FC, ReactNode } from 'react';
import theme from '../styles/theme';

// Use require instead of import, and order matters
require('@solana/wallet-adapter-react-ui/styles.css');


const WalletConnectionProvider = dynamic<{ children: ReactNode }>(
    () =>
        import('../components/WalletConnectionProvider').then(
            ({ WalletConnectionProvider }) => WalletConnectionProvider
        ),
    {
        ssr: false,
    }
);

const App: FC<AppProps> = ({ Component, pageProps }) => {
    return (
        <ThemeProvider theme={theme}>
            <WalletConnectionProvider>
                <WalletModalProvider>
                    <Component {...pageProps} />
                </WalletModalProvider>
            </WalletConnectionProvider>
        </ThemeProvider>
    );
};

export default App;
