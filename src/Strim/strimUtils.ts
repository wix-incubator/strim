import { IStrimExecFuncDataPiped, Environment } from '../types'
import { isObservable, Observable, of } from 'rxjs'
import { WebSocketSubject } from 'rxjs/webSocket'
import hash from 'object-hash'

// @ts-ignore
export const isBrowser = () => typeof __webpack_require__ === 'function'
// export const isNode = () =>

export const getDefaultEnv = () => {
  return isBrowser() ? Environment.Client : Environment.Server
}

export const splitToEnvironment = (
  items: IStrimExecFuncDataPiped[],
): IStrimExecFuncDataPiped[][] => {
  return items.reduce((splittedItems, currentItem) => {
    const lastItem =
      splittedItems[splittedItems.length - 1] &&
      splittedItems[splittedItems.length - 1][0]

    if (!lastItem || currentItem.env !== lastItem.env) {
      splittedItems.push([currentItem])
    } else {
      splittedItems[splittedItems.length - 1].push(currentItem)
    }

    return splittedItems
  }, [])
}

export const convertToPipeableFuncs = async (
  pipeItemsByEnvironment: IStrimExecFuncDataPiped[][],
): Promise<[[any?]?]> => {
  const pipeableFuncsByEnvironment: [[any?]?] = []

  for (const environmentalItems of pipeItemsByEnvironment) {
    const environmentalPipeableFunc: [any?] = []

    for (const item of environmentalItems) {
      // if (environmentalItems[0].env === Environment.Client) {
      const pipeableFunc = (await getPipeableFunc(item)) as any

      pipeableFunc.env = item.env
      environmentalPipeableFunc.push(pipeableFunc)
      // } else {
      //   environmentalPipeableFunc.push(await getPipeableFunc(item))
      //   environmentalPipeableFunc.push(item)
      // }
    }

    pipeableFuncsByEnvironment.push(environmentalPipeableFunc)
  }

  return pipeableFuncsByEnvironment
}

const pipeableWrapper = (scope, func, args: any[] = []) => <T>(
  source: Observable<T>,
) =>
  new Observable<T>(observer => {
    return source.subscribe({
      next(x) {
        const result = func.apply(scope, [args, x])

        if (isObservable(result)) {
          result.subscribe(observer)
        } else {
          observer.next(result)
        }
      },
      error(err) {
        observer.error(err)
      },
      complete() {
        observer.complete()
      },
    })
  })

const pipeableWsBridge = (wsSubject, pipeItems) => <T>(
  source: Observable<T>,
) => {
  const pipeHash = hash(pipeItems)
  const wsObservable = wsSubject.multiplex(
    () => JSON.stringify({ subscribe: pipeHash, pipeItems }),
    () => JSON.stringify({ unsubscribe: pipeHash }),
    message => message.type === pipeHash,
  )

  return new Observable<T>(observer => {
    const wsSubscriber = wsObservable.subscribe(
      x => {
        // console.log('got', x)
        if (x.error) {
          return observer.error(x.error)
        }
        return observer.next(x.value)
      },
      observer.error,
      observer.complete,
    )

    return source.subscribe(
      value => wsSubject.next(JSON.stringify({ pipeHash, value })),
      wsSubject.error,
      () => {
        // TODO: handle this correctly
        // wsSubscriber.unsubscribe()
        // return wsSubject.complete()
      },
    )
  })
}

export const getPipeableFunc = async (
  execFuncData: IStrimExecFuncDataPiped,
) => {
  const { module, func, args, env } = execFuncData

  if (isBrowser()) {
    // @ts-ignore
    const clientModule = window.strimClientModules[module]
    return pipeableWrapper(clientModule, clientModule[func], args)
  } else {
    const src = await import(module)
    return pipeableWrapper(src, src[func], args)
  }
}

export const convertToFullStrim = (
  pipeableFuncsByEnvironment: [[any?]?],
  webSocketSubject?: WebSocketSubject<any>,
) => {
  return pipeableFuncsByEnvironment.reduce(
    (observable, environmentalPipeableFunc, envIndex) => {
      // when sending to the server
      if (
        envIndex !== 0 &&
        environmentalPipeableFunc[0].env !== Environment.Client &&
        environmentalPipeableFunc[0].env !== Environment.ClientWorker
      ) {
        const previousPipeableFunc = pipeableFuncsByEnvironment[
          envIndex - 1
        ] as any
        if (
          previousPipeableFunc.env === Environment.Client ||
          previousPipeableFunc.env === Environment.ClientWorker
        ) {
          return observable.pipe(
            pipeableWsBridge(webSocketSubject, environmentalPipeableFunc),
          )
        }
      }

      return environmentalPipeableFunc.reduce((subObservable, pipeableFunc) => {
        return subObservable.pipe(pipeableFunc)
      }, observable)
      // TODO: switch environment operator
    },
    of(undefined),
  )
}
