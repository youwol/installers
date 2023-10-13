import { child$, VirtualDOM } from '@youwol/flux-view'
import { AssetsGateway, CdnBackend } from '@youwol/http-clients'
import { raiseHTTPErrors, onHTTPErrors } from '@youwol/http-primitives'
import { BehaviorSubject, combineLatest, from, Observable } from 'rxjs'
import {
    distinctUntilChanged,
    filter,
    map,
    mergeMap,
    share,
    shareReplay,
    tap,
} from 'rxjs/operators'
import { getUrlBase, install } from '@youwol/cdn-client'
import type * as fvInput from '@youwol/fv-input'
import { ExplorerView } from './package-explorer.view'
import { AssetLightDescription } from '@youwol/os-core'
import { setup } from '../../../auto-generated'

type MetadataResponse = CdnBackend.GetLibraryInfoResponse

export class PackageVersionSelect implements VirtualDOM {
    static ClassSelector = 'package-version-select'
    public readonly class = `${PackageVersionSelect.ClassSelector} d-flex align-items-center mx-2`
    public readonly children: VirtualDOM[]
    public readonly state: PackageInfoState

    constructor(params: {
        state: PackageInfoState
        fvInputModule: typeof fvInput
    }) {
        Object.assign(this, params)
        const Select = params.fvInputModule.Select
        const itemsData$ = this.state.metadata$.pipe(
            map((metadata) => {
                return metadata.versions.map((v) => new Select.ItemData(v, v))
            }),
        )
        const selectState = new Select.State(
            itemsData$,
            this.state.selectedVersion$,
        )
        this.children = [
            {
                innerText: 'Versions:',
                class: 'px-2',
            },
            new Select.View({ state: selectState }),
        ]
    }
}

export class PackageLinkSelect {
    static ClassSelector = 'package-link-select'
    public readonly class = `${PackageLinkSelect.ClassSelector} d-flex align-items-center mx-2`
    public readonly children: VirtualDOM[]
    public readonly state: PackageInfoState

    constructor(params: {
        state: PackageInfoState
        fvInputModule: typeof fvInput
    }) {
        Object.assign(this, params)
        const Select = params.fvInputModule.Select
        const itemsData$ = this.state.links$.pipe(
            map((links) => {
                return links.map((l) => new Select.ItemData(l.url, l.name))
            }),
        )
        const selectState = new Select.State(
            itemsData$,
            this.state.selectedLink$,
        )
        this.children = [
            {
                innerText: 'Reports:',
                class: 'px-2',
            },
            new Select.View({ state: selectState }),
        ]
    }
}

export class PackageInfoHeader {
    static ClassSelector = 'package-info-header'
    public readonly class = `${PackageInfoHeader.ClassSelector} d-flex w-100 justify-content-center`
    public readonly children: VirtualDOM[]
    public readonly state: PackageInfoState

    constructor(params: { state: PackageInfoState }) {
        Object.assign(this, params)
        const fvInputModule$ = from(
            install({
                modules: [
                    `@youwol/fv-input#${setup.runTimeDependencies.externals['@youwol/fv-input']}`,
                ],
                aliases: {
                    fvInputModule: `@youwol/fv-input_APIv${setup.exportedSymbols['@youwol/fv-input'].apiKey}`,
                },
            }),
        ) as unknown as Observable<{ fvInputModule: typeof fvInput }>
        this.children = [
            child$(
                fvInputModule$,
                ({ fvInputModule }) =>
                    new PackageVersionSelect({
                        state: this.state,
                        fvInputModule,
                    }),
            ),
            child$(
                fvInputModule$,
                ({ fvInputModule }) =>
                    new PackageLinkSelect({
                        state: this.state,
                        fvInputModule,
                    }),
            ),
        ]
    }
}

interface Link {
    name: string
    version: string
    url: string
}

export class PackageInfoState {
    static nativeExplorerId = 'native-explorer'

    public readonly asset: AssetLightDescription
    public readonly metadata$: Observable<MetadataResponse>
    public readonly selectedVersion$ = new BehaviorSubject<string>(undefined)
    public readonly links$: Observable<Link[]>
    public readonly selectedLink$ = new BehaviorSubject<string>(
        PackageInfoState.nativeExplorerId,
    )
    public readonly client = new AssetsGateway.Client().cdn

    constructor(params: { asset: AssetLightDescription }) {
        Object.assign(this, params)

        this.metadata$ = this.client
            .getLibraryInfo$({ libraryId: this.asset.rawId })
            .pipe(
                raiseHTTPErrors(),
                tap((metadata) => {
                    this.selectedVersion$.next(metadata.versions[0])
                }),
                shareReplay(1),
            )

        this.links$ = this.selectedVersion$.pipe(
            filter((v) => v != undefined),
            distinctUntilChanged(),
            mergeMap((version) => {
                return this.client
                    .getResource$({
                        libraryId: this.asset.rawId,
                        version,
                        restOfPath: '.yw_metadata.json',
                    })
                    .pipe(
                        onHTTPErrors((error) => {
                            if (error.status == 404) {
                                return { links: [] }
                            }
                            throw error
                        }),
                        map(({ links }: { links: { name; url }[] }) => {
                            return links
                                ? links.map((l) => ({ ...l, version }))
                                : []
                        }),
                        map((links) => {
                            return [
                                {
                                    name: 'Explorer',
                                    url: PackageInfoState.nativeExplorerId,
                                    version,
                                },
                                ...links,
                            ]
                        }),
                    )
            }),
            tap(() => {
                this.selectedLink$.next(PackageInfoState.nativeExplorerId)
            }),
            share(),
        )
    }
}

export class PackageInfoContent {
    static ClassSelector = 'package-info-content'
    public readonly class = `${PackageInfoHeader.ClassSelector} flex-grow-1 w-100`
    public readonly children: VirtualDOM[]
    public readonly state: PackageInfoState

    constructor(params: { state: PackageInfoState }) {
        Object.assign(this, params)
        this.children = [
            child$(
                combineLatest([
                    this.state.selectedLink$.pipe(
                        filter((l) => l != undefined),
                    ),
                    this.state.links$,
                ]),
                ([url, links]) => {
                    const link = links.find((l) => l.url == url)
                    if (url == PackageInfoState.nativeExplorerId) {
                        return new ExplorerView({
                            asset: this.state.asset,
                            version: link.version,
                        })
                    }
                    return {
                        tag: 'iframe',
                        class: 'h-100 w-100',
                        style: {
                            backgroundColor: 'white',
                        },
                        src: `${getUrlBase(
                            this.state.asset.name,
                            link.version,
                        )}/${link.url}`,
                    }
                },
            ),
        ]
    }
}

export class PackageInfoView {
    static ClassSelector = 'package-info-view'
    public readonly class = `${PackageInfoView.ClassSelector} d-flex flex-column p-2 h-100`
    public readonly children: VirtualDOM[]
    public readonly asset: AssetLightDescription
    public readonly state: PackageInfoState

    constructor(params: { asset: AssetLightDescription }) {
        Object.assign(this, params)
        this.state = new PackageInfoState({ asset: this.asset })

        this.children = [
            new PackageInfoHeader({
                state: this.state,
            }),
            new PackageInfoContent({
                state: this.state,
            }),
        ]
    }
}
