import { Observer } from 'rxjs'
import express from 'express'

export enum Environment {
  Server,
  Client,
}

export interface IBaseStrimExecFuncData {
  module: string
  func: string
  args?: any
}

export interface IStrimExecFuncDataInput extends IBaseStrimExecFuncData {
  env?: Environment
}

export interface IStrimExecFuncDataPiped extends IBaseStrimExecFuncData {
  env: Environment
}

export interface IStrimModulesOptions {
  wsRoute?: string
  modulesPath?: string
}

export interface IStrimOptions {
  wsUrl?: string
}

//export type PipeItem = IStrimExecFuncData | Environment

export interface IStrim {
  pipe(strim: IStrimExecFuncDataInput): IStrim
  subscribe(observer: Observer<any>): IStrim
  to(env: Environment): IStrim
}

type eventCallback = (message: string) => void
type wsOnType = (event: string, callback: eventCallback) => void
type wsSendType = (data: any) => void
type IWsCallback = (
  ws: { on: wsOnType; send: wsSendType },
  req: express.Request,
) => void

export interface IRouterWithWebSockets extends express.Router {
  ws(path: string, callback: IWsCallback): void
}
