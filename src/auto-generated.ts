
const runTimeDependencies = {
    "externals": {
        "@youwol/http-clients": "^3.0.1",
        "@youwol/http-primitives": "^0.2.5",
        "@youwol/os-core": "^0.2.1",
        "@youwol/os-widgets": "^0.2.6",
        "@youwol/webpm-client": "^3.0.7",
        "rxjs": "^7.5.6"
    },
    "includedInBundle": {}
}
const externals = {
    "@youwol/http-clients": {
        "commonjs": "@youwol/http-clients",
        "commonjs2": "@youwol/http-clients",
        "root": "@youwol/http-clients_APIv3"
    },
    "@youwol/http-primitives": {
        "commonjs": "@youwol/http-primitives",
        "commonjs2": "@youwol/http-primitives",
        "root": "@youwol/http-primitives_APIv02"
    },
    "@youwol/os-core": {
        "commonjs": "@youwol/os-core",
        "commonjs2": "@youwol/os-core",
        "root": "@youwol/os-core_APIv02"
    },
    "@youwol/os-widgets": {
        "commonjs": "@youwol/os-widgets",
        "commonjs2": "@youwol/os-widgets",
        "root": "@youwol/os-widgets_APIv02"
    },
    "@youwol/webpm-client": {
        "commonjs": "@youwol/webpm-client",
        "commonjs2": "@youwol/webpm-client",
        "root": "@youwol/webpm-client_APIv3"
    },
    "rxjs": {
        "commonjs": "rxjs",
        "commonjs2": "rxjs",
        "root": "rxjs_APIv7"
    },
    "rxjs/operators": {
        "commonjs": "rxjs/operators",
        "commonjs2": "rxjs/operators",
        "root": [
            "rxjs_APIv7",
            "operators"
        ]
    }
}
const exportedSymbols = {
    "@youwol/http-clients": {
        "apiKey": "3",
        "exportedSymbol": "@youwol/http-clients"
    },
    "@youwol/http-primitives": {
        "apiKey": "02",
        "exportedSymbol": "@youwol/http-primitives"
    },
    "@youwol/os-core": {
        "apiKey": "02",
        "exportedSymbol": "@youwol/os-core"
    },
    "@youwol/os-widgets": {
        "apiKey": "02",
        "exportedSymbol": "@youwol/os-widgets"
    },
    "@youwol/webpm-client": {
        "apiKey": "3",
        "exportedSymbol": "@youwol/webpm-client"
    },
    "rxjs": {
        "apiKey": "7",
        "exportedSymbol": "rxjs"
    }
}

const mainEntry : {entryFile: string,loadDependencies:string[]} = {
    "entryFile": "./lib/index.ts",
    "loadDependencies": [
        "@youwol/os-core",
        "@youwol/http-clients",
        "@youwol/http-primitives",
        "rxjs",
        "@youwol/webpm-client"
    ]
}

const secondaryEntries : {[k:string]:{entryFile: string, name: string, loadDependencies:string[]}}= {}

const entries = {
     '@youwol/installers': './lib/index.ts',
    ...Object.values(secondaryEntries).reduce( (acc,e) => ({...acc, [`@youwol/installers/${e.name}`]:e.entryFile}), {})
}
export const setup = {
    name:'@youwol/installers',
        assetId:'QHlvdXdvbC9pbnN0YWxsZXJz',
    version:'0.1.1',
    shortDescription:"Gathers YouWol installers",
    developerDocumentation:'https://platform.youwol.com/applications/@youwol/cdn-explorer/latest?package=@youwol/installers&tab=doc',
    npmPackage:'https://www.npmjs.com/package/@youwol/installers',
    sourceGithub:'https://github.com/youwol/installers',
    userGuide:'https://l.youwol.com/doc/@youwol/installers',
    apiVersion:'01',
    runTimeDependencies,
    externals,
    exportedSymbols,
    entries,
    secondaryEntries,
    getDependencySymbolExported: (module:string) => {
        return `${exportedSymbols[module].exportedSymbol}_APIv${exportedSymbols[module].apiKey}`
    },

    installMainModule: ({cdnClient, installParameters}:{
        cdnClient:{install:(unknown) => Promise<WindowOrWorkerGlobalScope>},
        installParameters?
    }) => {
        const parameters = installParameters || {}
        const scripts = parameters.scripts || []
        const modules = [
            ...(parameters.modules || []),
            ...mainEntry.loadDependencies.map( d => `${d}#${runTimeDependencies.externals[d]}`)
        ]
        return cdnClient.install({
            ...parameters,
            modules,
            scripts,
        }).then(() => {
            return window[`@youwol/installers_APIv01`]
        })
    },
    installAuxiliaryModule: ({name, cdnClient, installParameters}:{
        name: string,
        cdnClient:{install:(unknown) => Promise<WindowOrWorkerGlobalScope>},
        installParameters?
    }) => {
        const entry = secondaryEntries[name]
        if(!entry){
            throw Error(`Can not find the secondary entry '${name}'. Referenced in template.py?`)
        }
        const parameters = installParameters || {}
        const scripts = [
            ...(parameters.scripts || []),
            `@youwol/installers#0.1.1~dist/@youwol/installers/${entry.name}.js`
        ]
        const modules = [
            ...(parameters.modules || []),
            ...entry.loadDependencies.map( d => `${d}#${runTimeDependencies.externals[d]}`)
        ]
        return cdnClient.install({
            ...parameters,
            modules,
            scripts,
        }).then(() => {
            return window[`@youwol/installers/${entry.name}_APIv01`]
        })
    },
    getCdnDependencies(name?: string){
        if(name && !secondaryEntries[name]){
            throw Error(`Can not find the secondary entry '${name}'. Referenced in template.py?`)
        }
        const deps = name ? secondaryEntries[name].loadDependencies : mainEntry.loadDependencies

        return deps.map( d => `${d}#${runTimeDependencies.externals[d]}`)
    }
}
