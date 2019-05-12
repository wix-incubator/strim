import { Observer } from 'rxjs'
import { webSocket, WebSocketSubject } from 'rxjs/webSocket'
import * as utils from './strimUtils'
// import * as nodeUtils from '../strimModules/utils'
import {
  Environment,
  IStrimExecFuncDataInput,
  IStrimExecFuncDataPiped,
  IStrimOptions,
} from '../types'

interface IStrim {
  pipe(strim: IStrimExecFuncDataInput): IStrim
  subscribe(observer: Observer<any>): Promise<IStrim>
  to(env: Environment): IStrim
  toServer(worker?: boolean): IStrim
  toClient(worker?: boolean): IStrim
}

function addScript(src: string) {
  const head = document.getElementsByTagName('head')[0]
  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.src = src
  head.appendChild(script)
}
if (utils.isBrowser()) {
  addScript('/strim/strim.js')
}

export default class Strim implements IStrim {
  private pipeItems: IStrimExecFuncDataPiped[] = []
  private lastEnv: Environment
  //private websocketSubject: WebSocketSubject<any>
  private wsUrl: string
  private ws: WebSocketSubject<any>
  private nodeWorker: any

  constructor({ wsUrl = 'ws://localhost:4321/strim/ws' }: IStrimOptions = {}) {
    this.lastEnv = utils.getDefaultEnv()
    this.wsUrl = wsUrl
  }

  public pipe(strim: IStrimExecFuncDataInput): IStrim {
    const pipeItem: IStrimExecFuncDataPiped = {
      ...strim,
      env: strim.env ? strim.env : this.lastEnv,
    }

    this.lastEnv = pipeItem.env
    this.pipeItems.push(pipeItem)
    return this
  }

  public to(env: Environment): IStrim {
    this.lastEnv = env
    if (
      !this.ws &&
      (env === Environment.Server || env === Environment.ServerWorker)
    ) {
      // @ts-ignore
      this.ws = webSocket({ url: this.wsUrl })
    }

    if (
      !this.nodeWorker &&
      env === Environment.ServerWorker &&
      utils.getDefaultEnv() === Environment.Server
    ) {
      // this.nodeWorker = nodeUtils.getNodeStrimWorker()
    }
    return this
  }

  public toServer(worker: boolean = false): IStrim {
    if (worker) {
      return this.to(Environment.ServerWorker)
    }
    return this.to(Environment.Server)
  }

  public toClient(worker: boolean = false): IStrim {
    if (worker) {
      return this.to(Environment.ClientWorker)
    }
    return this.to(Environment.Client)
  }

  public async subscribe(
    observerOrNext: Observer<any> | ((value: any) => void) = console.log,
    error: (error: any) => void = console.error,
    complete?: () => void,
  ): Promise<IStrim> {
    const pipeItemsByEnvironment = utils.splitToEnvironment(this.pipeItems)

    const pipeableFuncsByEnvironment = await utils.convertToPipeableFuncs(
      pipeItemsByEnvironment,
    )

    const fullStrim = utils.convertToFullStrim(
      pipeableFuncsByEnvironment,
      this.ws,
      this.nodeWorker,
    )

    // @ts-ignore
    fullStrim.subscribe(observerOrNext, error, complete)

    return this
  }
}
