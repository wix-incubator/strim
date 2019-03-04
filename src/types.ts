import { Observer } from 'rxjs'
import express from 'express'

export interface IStrimExecFuncData {
  module: string
  func: string
  args?: any
}

export interface IStrimModulesOptions {
  wsRoute?: string
  modulesPath?: string
}

export enum Environment {
  Server,
  Client,
}

export type PipeItem = IStrimExecFuncData | Environment

export interface IStrim {
  pipe(strim: IStrimExecFuncData): IStrim
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
