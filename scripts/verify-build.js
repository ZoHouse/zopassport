const Module = require('module');
const originalRequire = Module.prototype.require;

// Mock React Native and other UI dependencies
const mockComponent = () => 'MockComponent';
const mockRN = {
    View: mockComponent,
    Text: mockComponent,
    Image: mockComponent,
    ScrollView: mockComponent,
    Pressable: mockComponent,
    ActivityIndicator: mockComponent,
    StyleSheet: { create: (obj) => obj },
    Platform: { OS: 'ios' },
    SafeAreaView: mockComponent,
};

const mockReanimated = {
    default: {
        View: mockComponent,
        createAnimatedComponent: (c) => c,
    },
    FadeIn: {},
    FadeOut: {},
    FadeInUp: {},
    FadeOutUp: {},
    FadeInDown: {},
};

const mockSvg = {
    Svg: mockComponent,
    Path: mockComponent,
    Circle: mockComponent,
};

// Patch require to return mocks
Module.prototype.require = function (path) {
    if (path === 'react-native') return mockRN;
    if (path === 'react-native-reanimated') return mockReanimated;
    if (path === 'react-native-svg') return mockSvg;
    if (path === 'moment') return () => ({ format: () => 'date' });
    return originalRequire.apply(this, arguments);
};

const { ZoPassportSDK, ZoWallet } = require('../dist/index.js');

console.log('--- Verifying Core SDK Exports ---');

if (typeof ZoPassportSDK !== 'function') {
    console.error('FAIL: ZoPassportSDK is not exported as a constructor');
    process.exit(1);
} else {
    console.log('PASS: ZoPassportSDK is exported');
}

if (typeof ZoWallet !== 'function') {
    console.error('FAIL: ZoWallet is not exported');
    process.exit(1);
} else {
    console.log('PASS: ZoWallet is exported');
}

try {
    const sdk = new ZoPassportSDK({ clientKey: 'test-key' });
    console.log('PASS: ZoPassportSDK instantiated');

    if (sdk.wallet && typeof sdk.wallet.getBalance === 'function') {
        console.log('PASS: sdk.wallet.getBalance is available');
    } else {
        console.error('FAIL: sdk.wallet is missing or malformed');
        process.exit(1);
    }
} catch (e) {
    console.error('FAIL: Error instantiating SDK:', e);
    process.exit(1);
}

console.log('\n--- Verifying React Exports ---');

// Now require React exports with mocks in place
const ReactExports = require('../dist/react.js');

const expectedComponents = [
    'WalletScreen',
    'WalletCard',
    'TransactionList',
    'TransactionItem',
    'ZoToken'
];

let missingComponents = [];
expectedComponents.forEach(comp => {
    if (ReactExports[comp]) {
        console.log(`PASS: ${comp} is exported`);
    } else {
        console.error(`FAIL: ${comp} is missing`);
        missingComponents.push(comp);
    }
});

const expectedHooks = [
    'useWallet',
    'useWalletBalance',
    'useTransactions'
];

expectedHooks.forEach(hook => {
    if (ReactExports[hook]) {
        console.log(`PASS: ${hook} is exported`);
    } else {
        console.error(`FAIL: ${hook} is missing`);
        missingComponents.push(hook);
    }
});

if (missingComponents.length > 0) {
    console.error('Some React exports are missing!');
    process.exit(1);
}

console.log('\nSUCCESS: All verification checks passed!');
