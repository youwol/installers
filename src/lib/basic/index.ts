import { Installer, ExplorerState } from '@youwol/os-core'
import { AssetsBackend, ExplorerBackend } from '@youwol/http-clients'
import { uploadFile$ } from './asset-specific/upload-data'
import * as webpmClient from '@youwol/webpm-client'
import type * as osWidgetsModule from '@youwol/os-widgets'
import { setup } from '../../auto-generated'

async function installOsWidgets() {
    const version = setup.runTimeDependencies.externals['@youwol/os-widgets']
    return webpmClient.install({
        modules: [`@youwol/os-widgets#${version}`],
        aliases: {
            osWidgets: '@youwol/os-widgets',
        },
    }) as unknown as Promise<{ osWidgets: typeof osWidgetsModule }> // need os-widgets to be published
}

export async function install(installer: Installer): Promise<Installer> {
    return installer.with({
        fromManifests: [
            {
                id: '@youwol/installers.basic',
                applications: [
                    '@youwol/explorer',
                    '@youwol/cdn-explorer',
                ].concat(
                    location.hostname === 'localhost' ||
                        location.hostname === '127.0.0.1'
                        ? ['@youwol/co-lab']
                        : [],
                ),
                assetPreviews: ({
                    asset,
                    permissions,
                }: {
                    asset: AssetsBackend.GetAssetResponse
                    permissions: AssetsBackend.GetPermissionsResponse
                }) => {
                    return [
                        {
                            icon: 'fas fa-info',
                            name: 'Package info',
                            exe: () => {
                                return installOsWidgets().then(
                                    ({ osWidgets }) => {
                                        return osWidgets.webpmPackageInfoWidget(
                                            { asset },
                                        )
                                    },
                                )
                            },
                            applicable: () => {
                                return asset.kind == 'package'
                            },
                        },
                        {
                            icon: 'fas fa-info',
                            name: 'File info',
                            exe: () => {
                                return installOsWidgets().then(
                                    ({ osWidgets }) => {
                                        return osWidgets.fileInfoWidget({
                                            asset,
                                            permissions,
                                        })
                                    },
                                )
                            },
                            applicable: () => {
                                return asset.kind == 'data'
                            },
                        },
                    ]
                },
                contextMenuActions: ({
                    node,
                    explorer,
                }: {
                    node:
                        | ExplorerBackend.GetItemResponse
                        | ExplorerBackend.GetFolderResponse
                    explorer: ExplorerState
                }) => {
                    return [
                        {
                            name: 'Import data',
                            icon: { tag: 'div', class: 'fas fa-file-import' },
                            enabled: () => true,
                            exe: async () => {
                                const input = document.createElement('input')
                                input.setAttribute('type', 'file')
                                input.setAttribute('multiple', 'true')
                                input.dispatchEvent(new MouseEvent('click'))
                                input.onchange = () => {
                                    Array.from(input.files).forEach((file) => {
                                        const status = uploadFile$(node, file)
                                        explorer.newAsset({
                                            parentNode: node,
                                            pendingName: file.name,
                                            response$: status.response$,
                                            progress$: status.progress$,
                                        })
                                    })
                                    input.remove()
                                }
                            },
                            applicable: () =>
                                ExplorerBackend.isInstanceOfFolderResponse(
                                    node,
                                ),
                        },
                    ]
                },
            },
        ],
    })
}
