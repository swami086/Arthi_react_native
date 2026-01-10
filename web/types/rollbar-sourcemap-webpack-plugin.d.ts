declare module 'rollbar-sourcemap-webpack-plugin' {
    import { Plugin } from 'webpack';

    interface RollbarSourceMapPluginOptions {
        accessToken: string | undefined;
        version: string;
        publicPath: string;
        include?: string | string[];
        exclude?: string | string[];
        ignoreErrors?: boolean;
        silent?: boolean;
        rollbarEndpoint?: string;
        encodePostData?: boolean;
    }

    export default class RollbarSourceMapPlugin extends Plugin {
        constructor(options: RollbarSourceMapPluginOptions);
    }
}
