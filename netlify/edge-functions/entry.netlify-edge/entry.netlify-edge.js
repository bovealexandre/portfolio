/**
 * @license
 * @builder.io/qwik 0.9.0
 * Copyright Builder.io, Inc. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/BuilderIO/qwik/blob/main/LICENSE
 */
const EMPTY_ARRAY$1 = [];
const EMPTY_OBJ$1 = {};
const isSerializableObject = (v) => {
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || null === proto;
};
const isObject = (v) => v && "object" == typeof v;
const isArray = (v) => Array.isArray(v);
const isString = (v) => "string" == typeof v;
const isFunction = (v) => "function" == typeof v;
const QSlot = "q:slot";
const isPromise = (value) => value instanceof Promise;
const safeCall = (call, thenFn, rejectFn) => {
  try {
    const promise = call();
    return isPromise(promise) ? promise.then(thenFn, rejectFn) : thenFn(promise);
  } catch (e) {
    return rejectFn(e);
  }
};
const then = (promise, thenFn) => isPromise(promise) ? promise.then(thenFn) : thenFn(promise);
const promiseAll = (promises) => promises.some(isPromise) ? Promise.all(promises) : promises;
const isNotNullable = (v) => null != v;
const delay = (timeout) => new Promise((resolve) => {
  setTimeout(resolve, timeout);
});
let _context;
const tryGetInvokeContext = () => {
  if (!_context) {
    const context = "undefined" != typeof document && document && document.__q_context__;
    if (!context) {
      return;
    }
    return isArray(context) ? document.__q_context__ = newInvokeContextFromTuple(context) : context;
  }
  return _context;
};
const getInvokeContext = () => {
  const ctx = tryGetInvokeContext();
  if (!ctx) {
    throw qError(QError_useMethodOutsideContext);
  }
  return ctx;
};
const useInvokeContext = () => {
  const ctx = getInvokeContext();
  if ("qRender" !== ctx.$event$) {
    throw qError(QError_useInvokeContext);
  }
  return ctx.$hostElement$, ctx.$waitOn$, ctx.$renderCtx$, ctx.$subscriber$, ctx;
};
const invoke = (context, fn, ...args) => {
  const previousContext = _context;
  let returnValue;
  try {
    _context = context, returnValue = fn.apply(null, args);
  } finally {
    _context = previousContext;
  }
  return returnValue;
};
const waitAndRun = (ctx, callback) => {
  const waitOn = ctx.$waitOn$;
  if (0 === waitOn.length) {
    const result = callback();
    isPromise(result) && waitOn.push(result);
  } else {
    waitOn.push(Promise.all(waitOn).then(callback));
  }
};
const newInvokeContextFromTuple = (context) => {
  const element = context[0];
  return newInvokeContext(void 0, element, context[1], context[2]);
};
const newInvokeContext = (hostElement, element, event, url) => ({
  $seq$: 0,
  $hostElement$: hostElement,
  $element$: element,
  $event$: event,
  $url$: url,
  $qrl$: void 0,
  $props$: void 0,
  $renderCtx$: void 0,
  $subscriber$: void 0,
  $waitOn$: void 0
});
const getWrappingContainer = (el) => el.closest("[q\\:container]");
const isNode = (value) => value && "number" == typeof value.nodeType;
const isDocument = (value) => value && 9 === value.nodeType;
const isElement = (value) => 1 === value.nodeType;
const isQwikElement = (value) => isNode(value) && (1 === value.nodeType || 111 === value.nodeType);
const isVirtualElement = (value) => 111 === value.nodeType;
const isModule = (module) => isObject(module) && "Module" === module[Symbol.toStringTag];
let _platform = (() => {
  const moduleCache = /* @__PURE__ */ new Map();
  return {
    isServer: false,
    importSymbol(containerEl, url, symbolName) {
      const urlDoc = ((doc, containerEl2, url2) => {
        var _a2;
        const baseURI = doc.baseURI;
        const base = new URL((_a2 = containerEl2.getAttribute("q:base")) != null ? _a2 : baseURI, baseURI);
        return new URL(url2, base);
      })(containerEl.ownerDocument, containerEl, url).toString();
      const urlCopy = new URL(urlDoc);
      urlCopy.hash = "", urlCopy.search = "";
      const importURL = urlCopy.href;
      const mod = moduleCache.get(importURL);
      return mod ? mod[symbolName] : import(importURL).then((mod2) => {
        return module = mod2, mod2 = Object.values(module).find(isModule) || module, moduleCache.set(importURL, mod2), mod2[symbolName];
        var module;
      });
    },
    raf: (fn) => new Promise((resolve) => {
      requestAnimationFrame(() => {
        resolve(fn());
      });
    }),
    nextTick: (fn) => new Promise((resolve) => {
      setTimeout(() => {
        resolve(fn());
      });
    }),
    chunkForSymbol() {
    }
  };
})();
const setPlatform = (plt) => _platform = plt;
const getPlatform = () => _platform;
const isServer$1 = () => _platform.isServer;
const directSetAttribute = (el, prop, value) => el.setAttribute(prop, value);
const directGetAttribute = (el, prop) => el.getAttribute(prop);
const ON_PROP_REGEX = /^(on|window:|document:)/;
const isOnProp = (prop) => prop.endsWith("$") && ON_PROP_REGEX.test(prop);
const addQRLListener = (listenersMap, prop, input) => {
  let existingListeners = listenersMap[prop];
  existingListeners || (listenersMap[prop] = existingListeners = []);
  for (const qrl of input) {
    const hash = qrl.$hash$;
    let replaced = false;
    for (let i = 0; i < existingListeners.length; i++) {
      if (existingListeners[i].$hash$ === hash) {
        existingListeners.splice(i, 1, qrl), replaced = true;
        break;
      }
    }
    replaced || existingListeners.push(qrl);
  }
  return false;
};
const setEvent = (listenerMap, prop, input) => {
  prop.endsWith("$");
  const qrls = isArray(input) ? input.map(ensureQrl) : [ensureQrl(input)];
  return prop = normalizeOnProp(prop.slice(0, -1)), addQRLListener(listenerMap, prop, qrls), prop;
};
const ensureQrl = (value) => isQrl$1(value) ? value : $(value);
const getDomListeners = (ctx, containerEl) => {
  const attributes = ctx.$element$.attributes;
  const listeners = {};
  for (let i = 0; i < attributes.length; i++) {
    const { name, value } = attributes.item(i);
    if (name.startsWith("on:") || name.startsWith("on-window:") || name.startsWith("on-document:")) {
      let array = listeners[name];
      array || (listeners[name] = array = []);
      const urls = value.split("\n");
      for (const url of urls) {
        const qrl = parseQRL(url, containerEl);
        qrl.$capture$ && inflateQrl(qrl, ctx), array.push(qrl);
      }
    }
  }
  return listeners;
};
const useSequentialScope = () => {
  const ctx = useInvokeContext();
  const i = ctx.$seq$;
  const hostElement = ctx.$hostElement$;
  const elCtx = getContext(hostElement);
  const seq = elCtx.$seq$ ? elCtx.$seq$ : elCtx.$seq$ = [];
  return ctx.$seq$++, {
    get: seq[i],
    set: (value) => seq[i] = value,
    i,
    ctx
  };
};
const useOn = (event, eventQrl) => _useOn(`on-${event}`, eventQrl);
const _useOn = (eventName, eventQrl) => {
  const invokeCtx = useInvokeContext();
  const ctx = getContext(invokeCtx.$hostElement$);
  addQRLListener(ctx.li, normalizeOnProp(eventName), [eventQrl]);
};
const getDocument = (node) => "undefined" != typeof document ? document : 9 === node.nodeType ? node : node.ownerDocument;
const jsx = (type, props, key) => {
  const processed = null == key ? null : String(key);
  return new JSXNodeImpl(type, props, processed);
};
class JSXNodeImpl {
  constructor(type, props, key = null) {
    this.type = type, this.props = props, this.key = key;
  }
}
const isJSXNode = (n) => n instanceof JSXNodeImpl;
const Fragment = (props) => props.children;
const SkipRender = Symbol("skip render");
const SSRComment = () => null;
const Virtual = (props) => props.children;
const InternalSSRStream = () => null;
const fromCamelToKebabCase = (text) => text.replace(/([A-Z])/g, "-$1").toLowerCase();
const setAttribute = (ctx, el, prop, value) => {
  ctx ? ctx.$operations$.push({
    $operation$: _setAttribute,
    $args$: [el, prop, value]
  }) : _setAttribute(el, prop, value);
};
const _setAttribute = (el, prop, value) => {
  if (null == value || false === value) {
    el.removeAttribute(prop);
  } else {
    const str = true === value ? "" : String(value);
    directSetAttribute(el, prop, str);
  }
};
const setProperty = (ctx, node, key, value) => {
  ctx ? ctx.$operations$.push({
    $operation$: _setProperty,
    $args$: [node, key, value]
  }) : _setProperty(node, key, value);
};
const _setProperty = (node, key, value) => {
  try {
    node[key] = value;
  } catch (err) {
    logError(codeToText(QError_setProperty), {
      node,
      key,
      value
    }, err);
  }
};
const createElement = (doc, expectTag, isSvg) => isSvg ? doc.createElementNS(SVG_NS, expectTag) : doc.createElement(expectTag);
const insertBefore = (ctx, parent, newChild, refChild) => (ctx.$operations$.push({
  $operation$: directInsertBefore,
  $args$: [parent, newChild, refChild || null]
}), newChild);
const appendChild = (ctx, parent, newChild) => (ctx.$operations$.push({
  $operation$: directAppendChild,
  $args$: [parent, newChild]
}), newChild);
const appendHeadStyle = (ctx, styleTask) => {
  ctx.$containerState$.$styleIds$.add(styleTask.styleId), ctx.$postOperations$.push({
    $operation$: _appendHeadStyle,
    $args$: [ctx.$containerState$.$containerEl$, styleTask]
  });
};
const _setClasslist = (elm, toRemove, toAdd) => {
  const classList = elm.classList;
  classList.remove(...toRemove), classList.add(...toAdd);
};
const _appendHeadStyle = (containerEl, styleTask) => {
  const doc = getDocument(containerEl);
  const isDoc = doc.documentElement === containerEl;
  const headEl = doc.head;
  const style = doc.createElement("style");
  directSetAttribute(style, "q:style", styleTask.styleId), style.textContent = styleTask.content, isDoc && headEl ? directAppendChild(headEl, style) : directInsertBefore(containerEl, style, containerEl.firstChild);
};
const removeNode = (ctx, el) => {
  ctx.$operations$.push({
    $operation$: _removeNode,
    $args$: [el, ctx]
  });
};
const _removeNode = (el, staticCtx) => {
  const parent = el.parentElement;
  if (parent) {
    if (1 === el.nodeType || 111 === el.nodeType) {
      const subsManager = staticCtx.$containerState$.$subsManager$;
      cleanupTree(el, staticCtx, subsManager, true);
    }
    directRemoveChild(parent, el);
  }
};
const createTemplate = (doc, slotName) => {
  const template = createElement(doc, "q:template", false);
  return directSetAttribute(template, QSlot, slotName), directSetAttribute(template, "hidden", ""), directSetAttribute(template, "aria-hidden", "true"), template;
};
const executeDOMRender = (ctx) => {
  for (const op of ctx.$operations$) {
    op.$operation$.apply(void 0, op.$args$);
  }
  resolveSlotProjection(ctx);
};
const getKey = (el) => directGetAttribute(el, "q:key");
const setKey = (el, key) => {
  null !== key && directSetAttribute(el, "q:key", key);
};
const resolveSlotProjection = (ctx) => {
  const subsManager = ctx.$containerState$.$subsManager$;
  ctx.$rmSlots$.forEach((slotEl) => {
    const key = getKey(slotEl);
    const slotChildren = getChildren(slotEl, "root");
    if (slotChildren.length > 0) {
      const sref = slotEl.getAttribute("q:sref");
      const hostCtx = ctx.$roots$.find((r) => r.$id$ === sref);
      if (hostCtx) {
        const template = createTemplate(ctx.$doc$, key);
        const hostElm = hostCtx.$element$;
        for (const child of slotChildren) {
          directAppendChild(template, child);
        }
        directInsertBefore(hostElm, template, hostElm.firstChild);
      } else {
        cleanupTree(slotEl, ctx, subsManager, false);
      }
    }
  }), ctx.$addSlots$.forEach(([slotEl, hostElm]) => {
    const key = getKey(slotEl);
    const template = Array.from(hostElm.childNodes).find((node) => isSlotTemplate(node) && node.getAttribute(QSlot) === key);
    template && (getChildren(template, "root").forEach((child) => {
      directAppendChild(slotEl, child);
    }), template.remove());
  });
};
class VirtualElementImpl {
  constructor(open, close) {
    this.open = open, this.close = close, this._qc_ = null, this.nodeType = 111, this.localName = ":virtual", this.nodeName = ":virtual";
    const doc = this.ownerDocument = open.ownerDocument;
    this.template = createElement(doc, "template", false), this.attributes = ((str) => {
      if (!str) {
        return /* @__PURE__ */ new Map();
      }
      const attributes = str.split(" ");
      return new Map(attributes.map((attr) => {
        const index2 = attr.indexOf("=");
        return index2 >= 0 ? [attr.slice(0, index2), (s = attr.slice(index2 + 1), s.replace(/\+/g, " "))] : [attr, ""];
        var s;
      }));
    })(open.data.slice(3)), open.data.startsWith("qv "), open.__virtual = this;
  }
  insertBefore(node, ref) {
    const parent = this.parentElement;
    if (parent) {
      const ref2 = ref || this.close;
      parent.insertBefore(node, ref2);
    } else {
      this.template.insertBefore(node, ref);
    }
    return node;
  }
  remove() {
    const parent = this.parentElement;
    if (parent) {
      const ch = Array.from(this.childNodes);
      this.template.childElementCount, parent.removeChild(this.open), this.template.append(...ch), parent.removeChild(this.close);
    }
  }
  appendChild(node) {
    return this.insertBefore(node, null);
  }
  insertBeforeTo(newParent, child) {
    const ch = Array.from(this.childNodes);
    newParent.insertBefore(this.open, child);
    for (const c of ch) {
      newParent.insertBefore(c, child);
    }
    newParent.insertBefore(this.close, child), this.template.childElementCount;
  }
  appendTo(newParent) {
    this.insertBeforeTo(newParent, null);
  }
  removeChild(child) {
    this.parentElement ? this.parentElement.removeChild(child) : this.template.removeChild(child);
  }
  getAttribute(prop) {
    var _a2;
    return (_a2 = this.attributes.get(prop)) != null ? _a2 : null;
  }
  hasAttribute(prop) {
    return this.attributes.has(prop);
  }
  setAttribute(prop, value) {
    this.attributes.set(prop, value), this.open.data = updateComment(this.attributes);
  }
  removeAttribute(prop) {
    this.attributes.delete(prop), this.open.data = updateComment(this.attributes);
  }
  matches(_) {
    return false;
  }
  compareDocumentPosition(other) {
    return this.open.compareDocumentPosition(other);
  }
  closest(query) {
    const parent = this.parentElement;
    return parent ? parent.closest(query) : null;
  }
  querySelectorAll(query) {
    const result = [];
    return getChildren(this, "elements").forEach((el) => {
      isQwikElement(el) && (el.matches(query) && result.push(el), result.concat(Array.from(el.querySelectorAll(query))));
    }), result;
  }
  querySelector(query) {
    for (const el of this.childNodes) {
      if (isElement(el)) {
        if (el.matches(query)) {
          return el;
        }
        const v = el.querySelector(query);
        if (null !== v) {
          return v;
        }
      }
    }
    return null;
  }
  get firstChild() {
    if (this.parentElement) {
      const first = this.open.nextSibling;
      return first === this.close ? null : first;
    }
    return this.template.firstChild;
  }
  get nextSibling() {
    return this.close.nextSibling;
  }
  get previousSibling() {
    return this.open.previousSibling;
  }
  get childNodes() {
    if (!this.parentElement) {
      return this.template.childNodes;
    }
    const nodes = [];
    let node = this.open;
    for (; (node = node.nextSibling) && node !== this.close; ) {
      nodes.push(node);
    }
    return nodes;
  }
  get isConnected() {
    return this.open.isConnected;
  }
  get parentElement() {
    return this.open.parentElement;
  }
}
const updateComment = (attributes) => `qv ${((map) => {
  const attributes2 = [];
  return map.forEach((value, key) => {
    var s;
    value ? attributes2.push(`${key}=${s = value, s.replace(/ /g, "+")}`) : attributes2.push(`${key}`);
  }), attributes2.join(" ");
})(attributes)}`;
const processVirtualNodes = (node) => {
  if (null == node) {
    return null;
  }
  if (isComment(node)) {
    const virtual = getVirtualElement(node);
    if (virtual) {
      return virtual;
    }
  }
  return node;
};
const getVirtualElement = (open) => {
  const virtual = open.__virtual;
  if (virtual) {
    return virtual;
  }
  if (open.data.startsWith("qv ")) {
    const close = findClose(open);
    return new VirtualElementImpl(open, close);
  }
  return null;
};
const findClose = (open) => {
  let node = open.nextSibling;
  let stack = 1;
  for (; node; ) {
    if (isComment(node)) {
      if (node.data.startsWith("qv ")) {
        stack++;
      } else if ("/qv" === node.data && (stack--, 0 === stack)) {
        return node;
      }
    }
    node = node.nextSibling;
  }
  throw new Error("close not found");
};
const isComment = (node) => 8 === node.nodeType;
const getRootNode = (node) => null == node ? null : isVirtualElement(node) ? node.open : node;
const createContext$1 = (name) => Object.freeze({
  id: fromCamelToKebabCase(name)
});
const useContextProvider = (context, newValue) => {
  const { get, set, ctx } = useSequentialScope();
  if (void 0 !== get) {
    return;
  }
  const hostElement = ctx.$hostElement$;
  const hostCtx = getContext(hostElement);
  let contexts = hostCtx.$contexts$;
  contexts || (hostCtx.$contexts$ = contexts = /* @__PURE__ */ new Map()), contexts.set(context.id, newValue), set(true);
};
const useContext = (context, defaultValue) => {
  const { get, set, ctx } = useSequentialScope();
  if (void 0 !== get) {
    return get;
  }
  const value = resolveContext(context, ctx.$hostElement$, ctx.$renderCtx$);
  if (void 0 !== value) {
    return set(value);
  }
  if (void 0 !== defaultValue) {
    return set(defaultValue);
  }
  throw qError(QError_notFoundContext, context.id);
};
const resolveContext = (context, hostElement, rctx) => {
  const contextID = context.id;
  if (rctx) {
    const contexts = rctx.$localStack$;
    for (let i = contexts.length - 1; i >= 0; i--) {
      const ctx = contexts[i];
      if (hostElement = ctx.$element$, ctx.$contexts$) {
        const found = ctx.$contexts$.get(contextID);
        if (found) {
          return found;
        }
      }
    }
  }
  if (hostElement.closest) {
    const value = queryContextFromDom(hostElement, contextID);
    if (void 0 !== value) {
      return value;
    }
  }
};
const queryContextFromDom = (hostElement, contextId) => {
  var _a2;
  let element = hostElement;
  for (; element; ) {
    let node = element;
    let virtual;
    for (; node && (virtual = findVirtual(node)); ) {
      const contexts = (_a2 = tryGetContext(virtual)) == null ? void 0 : _a2.$contexts$;
      if (contexts && contexts.has(contextId)) {
        return contexts.get(contextId);
      }
      node = virtual;
    }
    element = element.parentElement;
  }
};
const findVirtual = (el) => {
  let node = el;
  let stack = 1;
  for (; node = node.previousSibling; ) {
    if (isComment(node)) {
      if ("/qv" === node.data) {
        stack++;
      } else if (node.data.startsWith("qv ") && (stack--, 0 === stack)) {
        return getVirtualElement(node);
      }
    }
  }
  return null;
};
const ERROR_CONTEXT = createContext$1("qk-error");
const handleError = (err, hostElement, rctx) => {
  if (isServer$1()) {
    throw err;
  }
  {
    const errorStore = resolveContext(ERROR_CONTEXT, hostElement, rctx);
    if (void 0 === errorStore) {
      throw err;
    }
    errorStore.error = err;
  }
};
const executeComponent = (rctx, elCtx) => {
  elCtx.$dirty$ = false, elCtx.$mounted$ = true, elCtx.$slots$ = [];
  const hostElement = elCtx.$element$;
  const onRenderQRL = elCtx.$renderQrl$;
  const props = elCtx.$props$;
  const newCtx = pushRenderContext(rctx, elCtx);
  const invocatinContext = newInvokeContext(hostElement, void 0, "qRender");
  const waitOn = invocatinContext.$waitOn$ = [];
  newCtx.$cmpCtx$ = elCtx, invocatinContext.$subscriber$ = hostElement, invocatinContext.$renderCtx$ = rctx, onRenderQRL.$setContainer$(rctx.$static$.$containerState$.$containerEl$);
  const onRenderFn = onRenderQRL.getFn(invocatinContext);
  return safeCall(() => onRenderFn(props), (jsxNode) => (elCtx.$attachedListeners$ = false, waitOn.length > 0 ? Promise.all(waitOn).then(() => elCtx.$dirty$ ? executeComponent(rctx, elCtx) : {
    node: jsxNode,
    rctx: newCtx
  }) : elCtx.$dirty$ ? executeComponent(rctx, elCtx) : {
    node: jsxNode,
    rctx: newCtx
  }), (err) => (handleError(err, hostElement, rctx), {
    node: SkipRender,
    rctx: newCtx
  }));
};
const createRenderContext = (doc, containerState) => ({
  $static$: {
    $doc$: doc,
    $containerState$: containerState,
    $hostElements$: /* @__PURE__ */ new Set(),
    $operations$: [],
    $postOperations$: [],
    $roots$: [],
    $addSlots$: [],
    $rmSlots$: []
  },
  $cmpCtx$: void 0,
  $localStack$: []
});
const pushRenderContext = (ctx, elCtx) => ({
  $static$: ctx.$static$,
  $cmpCtx$: ctx.$cmpCtx$,
  $localStack$: ctx.$localStack$.concat(elCtx)
});
const serializeClass = (obj) => {
  if (isString(obj)) {
    return obj;
  }
  if (isObject(obj)) {
    if (isArray(obj)) {
      return obj.join(" ");
    }
    {
      let buffer = "";
      let previous = false;
      for (const key of Object.keys(obj)) {
        obj[key] && (previous && (buffer += " "), buffer += key, previous = true);
      }
      return buffer;
    }
  }
  return "";
};
const parseClassListRegex = /\s/;
const parseClassList = (value) => value ? value.split(parseClassListRegex) : EMPTY_ARRAY$1;
const stringifyStyle = (obj) => {
  if (null == obj) {
    return "";
  }
  if ("object" == typeof obj) {
    if (isArray(obj)) {
      throw qError(QError_stringifyClassOrStyle, obj, "style");
    }
    {
      const chunks = [];
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key];
          value && chunks.push(fromCamelToKebabCase(key) + ":" + value);
        }
      }
      return chunks.join(";");
    }
  }
  return String(obj);
};
const getNextIndex = (ctx) => intToStr(ctx.$static$.$containerState$.$elementIndex$++);
const setQId = (rctx, ctx) => {
  const id = getNextIndex(rctx);
  ctx.$id$ = id, ctx.$element$.setAttribute("q:id", id);
};
const SKIPS_PROPS = [QSlot, "q:renderFn", "children"];
const serializeSStyle = (scopeIds) => {
  const value = scopeIds.join(" ");
  if (value.length > 0) {
    return value;
  }
};
const renderComponent = (rctx, ctx, flags) => {
  const justMounted = !ctx.$mounted$;
  const hostElement = ctx.$element$;
  const containerState = rctx.$static$.$containerState$;
  return containerState.$hostsStaging$.delete(hostElement), containerState.$subsManager$.$clearSub$(hostElement), then(executeComponent(rctx, ctx), (res) => {
    const staticCtx = rctx.$static$;
    const newCtx = res.rctx;
    const invocatinContext = newInvokeContext(hostElement);
    if (staticCtx.$hostElements$.add(hostElement), invocatinContext.$subscriber$ = hostElement, invocatinContext.$renderCtx$ = newCtx, justMounted) {
      if (ctx.$appendStyles$) {
        for (const style of ctx.$appendStyles$) {
          appendHeadStyle(staticCtx, style);
        }
      }
      if (ctx.$scopeIds$) {
        const value = serializeSStyle(ctx.$scopeIds$);
        value && hostElement.setAttribute("q:sstyle", value);
      }
    }
    const processedJSXNode = processData$1(res.node, invocatinContext);
    return then(processedJSXNode, (processedJSXNode2) => {
      const newVdom = wrapJSX(hostElement, processedJSXNode2);
      const oldVdom = getVdom(ctx);
      return then(visitJsxNode(newCtx, oldVdom, newVdom, flags), () => {
        ctx.$vdom$ = newVdom;
      });
    });
  });
};
const getVdom = (ctx) => (ctx.$vdom$ || (ctx.$vdom$ = domToVnode(ctx.$element$)), ctx.$vdom$);
class ProcessedJSXNodeImpl {
  constructor($type$, $props$, $children$, $key$) {
    this.$type$ = $type$, this.$props$ = $props$, this.$children$ = $children$, this.$key$ = $key$, this.$elm$ = null, this.$text$ = "";
  }
}
const wrapJSX = (element, input) => {
  const children = void 0 === input ? EMPTY_ARRAY$1 : isArray(input) ? input : [input];
  const node = new ProcessedJSXNodeImpl(":virtual", {}, children, null);
  return node.$elm$ = element, node;
};
const processData$1 = (node, invocationContext) => {
  if (null != node && "boolean" != typeof node) {
    if (isString(node) || "number" == typeof node) {
      const newNode = new ProcessedJSXNodeImpl("#text", EMPTY_OBJ$1, EMPTY_ARRAY$1, null);
      return newNode.$text$ = String(node), newNode;
    }
    if (isJSXNode(node)) {
      return ((node2, invocationContext2) => {
        const key = null != node2.key ? String(node2.key) : null;
        const nodeType = node2.type;
        const props = node2.props;
        const originalChildren = props.children;
        let textType = "";
        if (isString(nodeType)) {
          textType = nodeType;
        } else {
          if (nodeType !== Virtual) {
            if (isFunction(nodeType)) {
              const res = invoke(invocationContext2, nodeType, props, node2.key);
              return processData$1(res, invocationContext2);
            }
            throw qError(QError_invalidJsxNodeType, nodeType);
          }
          textType = ":virtual";
        }
        let children = EMPTY_ARRAY$1;
        return null != originalChildren ? then(processData$1(originalChildren, invocationContext2), (result) => (void 0 !== result && (children = isArray(result) ? result : [result]), new ProcessedJSXNodeImpl(textType, props, children, key))) : new ProcessedJSXNodeImpl(textType, props, children, key);
      })(node, invocationContext);
    }
    if (isArray(node)) {
      const output = promiseAll(node.flatMap((n) => processData$1(n, invocationContext)));
      return then(output, (array) => array.flat(100).filter(isNotNullable));
    }
    return isPromise(node) ? node.then((node2) => processData$1(node2, invocationContext)) : node === SkipRender ? new ProcessedJSXNodeImpl(":skipRender", EMPTY_OBJ$1, EMPTY_ARRAY$1, null) : void logWarn("A unsupported value was passed to the JSX, skipping render. Value:", node);
  }
};
const SVG_NS = "http://www.w3.org/2000/svg";
const CHILDREN_PLACEHOLDER = [];
const visitJsxNode = (ctx, oldVnode, newVnode, flags) => smartUpdateChildren(ctx, oldVnode, newVnode, "root", flags);
const smartUpdateChildren = (ctx, oldVnode, newVnode, mode, flags) => {
  oldVnode.$elm$;
  const ch = newVnode.$children$;
  if (1 === ch.length && ":skipRender" === ch[0].$type$) {
    return;
  }
  const elm = oldVnode.$elm$;
  oldVnode.$children$ === CHILDREN_PLACEHOLDER && "HEAD" === elm.nodeName && (mode = "head", flags |= 2);
  const oldCh = getVnodeChildren(oldVnode, mode);
  return oldCh.length > 0 && ch.length > 0 ? updateChildren(ctx, elm, oldCh, ch, flags) : ch.length > 0 ? addVnodes(ctx, elm, null, ch, 0, ch.length - 1, flags) : oldCh.length > 0 ? removeVnodes(ctx.$static$, oldCh, 0, oldCh.length - 1) : void 0;
};
const getVnodeChildren = (vnode, mode) => {
  const oldCh = vnode.$children$;
  const elm = vnode.$elm$;
  return oldCh === CHILDREN_PLACEHOLDER ? vnode.$children$ = getChildrenVnodes(elm, mode) : oldCh;
};
const updateChildren = (ctx, parentElm, oldCh, newCh, flags) => {
  let oldStartIdx = 0;
  let newStartIdx = 0;
  let oldEndIdx = oldCh.length - 1;
  let oldStartVnode = oldCh[0];
  let oldEndVnode = oldCh[oldEndIdx];
  let newEndIdx = newCh.length - 1;
  let newStartVnode = newCh[0];
  let newEndVnode = newCh[newEndIdx];
  let oldKeyToIdx;
  let idxInOld;
  let elmToMove;
  const results = [];
  const staticCtx = ctx.$static$;
  for (; oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx; ) {
    if (null == oldStartVnode) {
      oldStartVnode = oldCh[++oldStartIdx];
    } else if (null == oldEndVnode) {
      oldEndVnode = oldCh[--oldEndIdx];
    } else if (null == newStartVnode) {
      newStartVnode = newCh[++newStartIdx];
    } else if (null == newEndVnode) {
      newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldStartVnode, newStartVnode)) {
      results.push(patchVnode(ctx, oldStartVnode, newStartVnode, flags)), oldStartVnode = oldCh[++oldStartIdx], newStartVnode = newCh[++newStartIdx];
    } else if (sameVnode(oldEndVnode, newEndVnode)) {
      results.push(patchVnode(ctx, oldEndVnode, newEndVnode, flags)), oldEndVnode = oldCh[--oldEndIdx], newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldStartVnode, newEndVnode)) {
      oldStartVnode.$elm$, oldEndVnode.$elm$, results.push(patchVnode(ctx, oldStartVnode, newEndVnode, flags)), insertBefore(staticCtx, parentElm, oldStartVnode.$elm$, oldEndVnode.$elm$.nextSibling), oldStartVnode = oldCh[++oldStartIdx], newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldEndVnode, newStartVnode)) {
      oldStartVnode.$elm$, oldEndVnode.$elm$, results.push(patchVnode(ctx, oldEndVnode, newStartVnode, flags)), insertBefore(staticCtx, parentElm, oldEndVnode.$elm$, oldStartVnode.$elm$), oldEndVnode = oldCh[--oldEndIdx], newStartVnode = newCh[++newStartIdx];
    } else {
      if (void 0 === oldKeyToIdx && (oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)), idxInOld = oldKeyToIdx[newStartVnode.$key$], void 0 === idxInOld) {
        const newElm = createElm(ctx, newStartVnode, flags);
        results.push(then(newElm, (newElm2) => {
          insertBefore(staticCtx, parentElm, newElm2, oldStartVnode.$elm$);
        }));
      } else if (elmToMove = oldCh[idxInOld], isTagName(elmToMove, newStartVnode.$type$)) {
        results.push(patchVnode(ctx, elmToMove, newStartVnode, flags)), oldCh[idxInOld] = void 0, elmToMove.$elm$, insertBefore(staticCtx, parentElm, elmToMove.$elm$, oldStartVnode.$elm$);
      } else {
        const newElm = createElm(ctx, newStartVnode, flags);
        results.push(then(newElm, (newElm2) => {
          insertBefore(staticCtx, parentElm, newElm2, oldStartVnode.$elm$);
        }));
      }
      newStartVnode = newCh[++newStartIdx];
    }
  }
  if (newStartIdx <= newEndIdx) {
    const before = null == newCh[newEndIdx + 1] ? null : newCh[newEndIdx + 1].$elm$;
    results.push(addVnodes(ctx, parentElm, before, newCh, newStartIdx, newEndIdx, flags));
  }
  let wait = promiseAll(results);
  return oldStartIdx <= oldEndIdx && (wait = then(wait, () => {
    removeVnodes(staticCtx, oldCh, oldStartIdx, oldEndIdx);
  })), wait;
};
const getCh = (elm, filter) => {
  const end = isVirtualElement(elm) ? elm.close : null;
  const nodes = [];
  let node = elm.firstChild;
  for (; (node = processVirtualNodes(node)) && (filter(node) && nodes.push(node), node = node.nextSibling, node !== end); ) {
  }
  return nodes;
};
const getChildren = (elm, mode) => {
  switch (mode) {
    case "root":
      return getCh(elm, isChildComponent);
    case "head":
      return getCh(elm, isHeadChildren);
    case "elements":
      return getCh(elm, isQwikElement);
  }
};
const getChildrenVnodes = (elm, mode) => getChildren(elm, mode).map(getVnodeFromEl);
const getVnodeFromEl = (el) => {
  var _a2, _b;
  return isElement(el) ? (_b = (_a2 = tryGetContext(el)) == null ? void 0 : _a2.$vdom$) != null ? _b : domToVnode(el) : domToVnode(el);
};
const domToVnode = (node) => {
  if (isQwikElement(node)) {
    const props = isVirtualElement(node) ? EMPTY_OBJ$1 : getProps(node);
    const t = new ProcessedJSXNodeImpl(node.localName, props, CHILDREN_PLACEHOLDER, getKey(node));
    return t.$elm$ = node, t;
  }
  if (3 === node.nodeType) {
    const t = new ProcessedJSXNodeImpl(node.nodeName, {}, CHILDREN_PLACEHOLDER, null);
    return t.$text$ = node.data, t.$elm$ = node, t;
  }
  throw new Error("invalid node");
};
const getProps = (node) => {
  const props = {};
  const attributes = node.attributes;
  const len = attributes.length;
  for (let i = 0; i < len; i++) {
    const attr = attributes.item(i);
    const name = attr.name;
    name.includes(":") || (props[name] = "class" === name ? parseDomClass(attr.value) : attr.value);
  }
  return props;
};
const parseDomClass = (value) => parseClassList(value).filter((c) => !c.startsWith("\u2B50\uFE0F")).join(" ");
const isHeadChildren = (node) => {
  const type = node.nodeType;
  return 1 === type ? node.hasAttribute("q:head") : 111 === type;
};
const isSlotTemplate = (node) => "Q:TEMPLATE" === node.nodeName;
const isChildComponent = (node) => {
  const type = node.nodeType;
  if (3 === type || 111 === type) {
    return true;
  }
  if (1 !== type) {
    return false;
  }
  const nodeName = node.nodeName;
  return "Q:TEMPLATE" !== nodeName && ("HEAD" !== nodeName || node.hasAttribute("q:head"));
};
const patchVnode = (rctx, oldVnode, newVnode, flags) => {
  oldVnode.$type$, newVnode.$type$;
  const elm = oldVnode.$elm$;
  const tag = newVnode.$type$;
  const staticCtx = rctx.$static$;
  const isVirtual = ":virtual" === tag;
  if (newVnode.$elm$ = elm, "#text" === tag) {
    return void (oldVnode.$text$ !== newVnode.$text$ && setProperty(staticCtx, elm, "data", newVnode.$text$));
  }
  let isSvg = !!(1 & flags);
  isSvg || "svg" !== tag || (flags |= 1, isSvg = true);
  const props = newVnode.$props$;
  const isComponent = isVirtual && "q:renderFn" in props;
  const elCtx = getContext(elm);
  if (!isComponent) {
    const listenerMap = updateProperties(elCtx, staticCtx, oldVnode.$props$, props, isSvg);
    const currentComponent = rctx.$cmpCtx$;
    if (currentComponent && !currentComponent.$attachedListeners$) {
      currentComponent.$attachedListeners$ = true;
      for (const key of Object.keys(currentComponent.li)) {
        addQRLListener(listenerMap, key, currentComponent.li[key]), addGlobalListener(staticCtx, elm, key);
      }
    }
    for (const key of Object.keys(listenerMap)) {
      setAttribute(staticCtx, elm, key, serializeQRLs(listenerMap[key], elCtx));
    }
    if (isSvg && "foreignObject" === newVnode.$type$ && (flags &= -2, isSvg = false), isVirtual && "q:s" in props) {
      const currentComponent2 = rctx.$cmpCtx$;
      return currentComponent2.$slots$, void currentComponent2.$slots$.push(newVnode);
    }
    if (void 0 !== props[dangerouslySetInnerHTML]) {
      return;
    }
    if (isVirtual && "qonce" in props) {
      return;
    }
    return smartUpdateChildren(rctx, oldVnode, newVnode, "root", flags);
  }
  let needsRender = setComponentProps$1(elCtx, rctx, props);
  return needsRender || elCtx.$renderQrl$ || elCtx.$element$.hasAttribute("q:id") || (setQId(rctx, elCtx), elCtx.$renderQrl$ = props["q:renderFn"], elCtx.$renderQrl$, needsRender = true), needsRender ? then(renderComponent(rctx, elCtx, flags), () => renderContentProjection(rctx, elCtx, newVnode, flags)) : renderContentProjection(rctx, elCtx, newVnode, flags);
};
const renderContentProjection = (rctx, hostCtx, vnode, flags) => {
  const newChildren = vnode.$children$;
  const staticCtx = rctx.$static$;
  const splittedNewChidren = ((input) => {
    var _a2;
    const output = {};
    for (const item of input) {
      const key = getSlotName(item);
      ((_a2 = output[key]) != null ? _a2 : output[key] = new ProcessedJSXNodeImpl(":virtual", {
        "q:s": ""
      }, [], key)).$children$.push(item);
    }
    return output;
  })(newChildren);
  const slotRctx = pushRenderContext(rctx, hostCtx);
  const slotMaps = getSlotMap(hostCtx);
  for (const key of Object.keys(slotMaps.slots)) {
    if (!splittedNewChidren[key]) {
      const slotEl = slotMaps.slots[key];
      const oldCh = getChildrenVnodes(slotEl, "root");
      if (oldCh.length > 0) {
        const slotCtx = tryGetContext(slotEl);
        slotCtx && slotCtx.$vdom$ && (slotCtx.$vdom$.$children$ = []), removeVnodes(staticCtx, oldCh, 0, oldCh.length - 1);
      }
    }
  }
  for (const key of Object.keys(slotMaps.templates)) {
    const templateEl = slotMaps.templates[key];
    templateEl && (splittedNewChidren[key] && !slotMaps.slots[key] || (removeNode(staticCtx, templateEl), slotMaps.templates[key] = void 0));
  }
  return promiseAll(Object.keys(splittedNewChidren).map((key) => {
    const newVdom = splittedNewChidren[key];
    const slotElm = getSlotElement(staticCtx, slotMaps, hostCtx.$element$, key);
    const slotCtx = getContext(slotElm);
    const oldVdom = getVdom(slotCtx);
    return slotCtx.$vdom$ = newVdom, newVdom.$elm$ = slotElm, smartUpdateChildren(slotRctx, oldVdom, newVdom, "root", flags);
  }));
};
const addVnodes = (ctx, parentElm, before, vnodes, startIdx, endIdx, flags) => {
  const promises = [];
  let hasPromise = false;
  for (; startIdx <= endIdx; ++startIdx) {
    const ch = vnodes[startIdx];
    const elm = createElm(ctx, ch, flags);
    promises.push(elm), isPromise(elm) && (hasPromise = true);
  }
  if (hasPromise) {
    return Promise.all(promises).then((children) => insertChildren(ctx.$static$, parentElm, children, before));
  }
  insertChildren(ctx.$static$, parentElm, promises, before);
};
const insertChildren = (ctx, parentElm, children, before) => {
  for (const child of children) {
    insertBefore(ctx, parentElm, child, before);
  }
};
const removeVnodes = (ctx, nodes, startIdx, endIdx) => {
  for (; startIdx <= endIdx; ++startIdx) {
    const ch = nodes[startIdx];
    ch && (ch.$elm$, removeNode(ctx, ch.$elm$));
  }
};
const getSlotElement = (ctx, slotMaps, parentEl, slotName) => {
  const slotEl = slotMaps.slots[slotName];
  if (slotEl) {
    return slotEl;
  }
  const templateEl = slotMaps.templates[slotName];
  if (templateEl) {
    return templateEl;
  }
  const template = createTemplate(ctx.$doc$, slotName);
  return ((ctx2, parent, newChild) => {
    ctx2.$operations$.push({
      $operation$: directInsertBefore,
      $args$: [parent, newChild, parent.firstChild]
    });
  })(ctx, parentEl, template), slotMaps.templates[slotName] = template, template;
};
const getSlotName = (node) => {
  var _a2;
  return (_a2 = node.$props$[QSlot]) != null ? _a2 : "";
};
const createElm = (rctx, vnode, flags) => {
  const tag = vnode.$type$;
  const doc = rctx.$static$.$doc$;
  if ("#text" === tag) {
    return vnode.$elm$ = ((doc2, text) => doc2.createTextNode(text))(doc, vnode.$text$);
  }
  let elm;
  let isHead = !!(2 & flags);
  let isSvg = !!(1 & flags);
  isSvg || "svg" !== tag || (flags |= 1, isSvg = true);
  const isVirtual = ":virtual" === tag;
  const props = vnode.$props$;
  const isComponent = "q:renderFn" in props;
  const staticCtx = rctx.$static$;
  isVirtual ? elm = ((doc2) => {
    const open = doc2.createComment("qv ");
    const close = doc2.createComment("/qv");
    return new VirtualElementImpl(open, close);
  })(doc) : "head" === tag ? (elm = doc.head, flags |= 2, isHead = true) : (elm = createElement(doc, tag, isSvg), flags &= -3), vnode.$elm$ = elm, isSvg && "foreignObject" === tag && (isSvg = false, flags &= -2);
  const elCtx = getContext(elm);
  if (isComponent) {
    setKey(elm, vnode.$key$);
    const renderQRL = props["q:renderFn"];
    return setComponentProps$1(elCtx, rctx, props), setQId(rctx, elCtx), elCtx.$renderQrl$ = renderQRL, then(renderComponent(rctx, elCtx, flags), () => {
      let children2 = vnode.$children$;
      if (0 === children2.length) {
        return elm;
      }
      1 === children2.length && ":skipRender" === children2[0].$type$ && (children2 = children2[0].$children$);
      const slotRctx = pushRenderContext(rctx, elCtx);
      const slotMap = getSlotMap(elCtx);
      const elements = children2.map((ch) => createElm(slotRctx, ch, flags));
      return then(promiseAll(elements), () => {
        for (const node of children2) {
          node.$elm$, appendChild(staticCtx, getSlotElement(staticCtx, slotMap, elm, getSlotName(node)), node.$elm$);
        }
        return elm;
      });
    });
  }
  const currentComponent = rctx.$cmpCtx$;
  const isSlot = isVirtual && "q:s" in props;
  const hasRef = !isVirtual && "ref" in props;
  const listenerMap = setProperties(staticCtx, elCtx, props, isSvg);
  if (currentComponent && !isVirtual) {
    const scopedIds = currentComponent.$scopeIds$;
    if (scopedIds && scopedIds.forEach((styleId) => {
      elm.classList.add(styleId);
    }), !currentComponent.$attachedListeners$) {
      currentComponent.$attachedListeners$ = true;
      for (const eventName of Object.keys(currentComponent.li)) {
        addQRLListener(listenerMap, eventName, currentComponent.li[eventName]);
      }
    }
  }
  isSlot ? (currentComponent.$slots$, setKey(elm, vnode.$key$), directSetAttribute(elm, "q:sref", currentComponent.$id$), currentComponent.$slots$.push(vnode), staticCtx.$addSlots$.push([elm, currentComponent.$element$])) : setKey(elm, vnode.$key$);
  {
    const listeners = Object.keys(listenerMap);
    isHead && !isVirtual && directSetAttribute(elm, "q:head", ""), (listeners.length > 0 || hasRef) && setQId(rctx, elCtx);
    for (const key of listeners) {
      setAttribute(staticCtx, elm, key, serializeQRLs(listenerMap[key], elCtx));
    }
  }
  if (void 0 !== props[dangerouslySetInnerHTML]) {
    return elm;
  }
  let children = vnode.$children$;
  if (0 === children.length) {
    return elm;
  }
  1 === children.length && ":skipRender" === children[0].$type$ && (children = children[0].$children$);
  const promises = children.map((ch) => createElm(rctx, ch, flags));
  return then(promiseAll(promises), () => {
    for (const node of children) {
      node.$elm$, appendChild(rctx.$static$, elm, node.$elm$);
    }
    return elm;
  });
};
const getSlotMap = (ctx) => {
  var _a2, _b;
  const slotsArray = ((ctx2) => ctx2.$slots$ || (ctx2.$element$.parentElement, ctx2.$slots$ = readDOMSlots(ctx2)))(ctx);
  const slots = {};
  const templates = {};
  const t = Array.from(ctx.$element$.childNodes).filter(isSlotTemplate);
  for (const vnode of slotsArray) {
    vnode.$elm$, slots[(_a2 = vnode.$key$) != null ? _a2 : ""] = vnode.$elm$;
  }
  for (const elm of t) {
    templates[(_b = directGetAttribute(elm, QSlot)) != null ? _b : ""] = elm;
  }
  return {
    slots,
    templates
  };
};
const readDOMSlots = (ctx) => ((el, prop, value) => {
  const walker = ((el2, prop2, value2) => el2.ownerDocument.createTreeWalker(el2, 128, {
    acceptNode(c) {
      const virtual = getVirtualElement(c);
      return virtual && directGetAttribute(virtual, "q:sref") === value2 ? 1 : 2;
    }
  }))(el, 0, value);
  const pars = [];
  let currentNode = null;
  for (; currentNode = walker.nextNode(); ) {
    pars.push(getVirtualElement(currentNode));
  }
  return pars;
})(ctx.$element$.parentElement, 0, ctx.$id$).map(domToVnode);
const checkBeforeAssign = (ctx, elm, prop, newValue) => (prop in elm && elm[prop] !== newValue && setProperty(ctx, elm, prop, newValue), true);
const dangerouslySetInnerHTML = "dangerouslySetInnerHTML";
const PROP_HANDLER_MAP = {
  style: (ctx, elm, _, newValue) => (setProperty(ctx, elm.style, "cssText", stringifyStyle(newValue)), true),
  class: (ctx, elm, _, newValue, oldValue) => {
    const oldClasses = parseClassList(oldValue);
    const newClasses = parseClassList(newValue);
    return ((ctx2, elm2, toRemove, toAdd) => {
      ctx2 ? ctx2.$operations$.push({
        $operation$: _setClasslist,
        $args$: [elm2, toRemove, toAdd]
      }) : _setClasslist(elm2, toRemove, toAdd);
    })(ctx, elm, oldClasses.filter((c) => c && !newClasses.includes(c)), newClasses.filter((c) => c && !oldClasses.includes(c))), true;
  },
  value: checkBeforeAssign,
  checked: checkBeforeAssign,
  [dangerouslySetInnerHTML]: (ctx, elm, _, newValue) => (dangerouslySetInnerHTML in elm ? setProperty(ctx, elm, dangerouslySetInnerHTML, newValue) : "innerHTML" in elm && setProperty(ctx, elm, "innerHTML", newValue), true),
  innerHTML: () => true
};
const updateProperties = (elCtx, staticCtx, oldProps, newProps, isSvg) => {
  const keys = getKeys(oldProps, newProps);
  const listenersMap = elCtx.li = {};
  if (0 === keys.length) {
    return listenersMap;
  }
  const elm = elCtx.$element$;
  for (let key of keys) {
    if ("children" === key) {
      continue;
    }
    let newValue = newProps[key];
    "className" === key && (newProps.class = newValue, key = "class"), "class" === key && (newProps.class = newValue = serializeClass(newValue));
    const oldValue = oldProps[key];
    if (oldValue === newValue) {
      continue;
    }
    if ("ref" === key) {
      newValue.current = elm;
      continue;
    }
    if (isOnProp(key)) {
      setEvent(listenersMap, key, newValue);
      continue;
    }
    const exception = PROP_HANDLER_MAP[key];
    exception && exception(staticCtx, elm, key, newValue, oldValue) || (isSvg || !(key in elm) ? setAttribute(staticCtx, elm, key, newValue) : setProperty(staticCtx, elm, key, newValue));
  }
  return listenersMap;
};
const getKeys = (oldProps, newProps) => {
  const keys = Object.keys(newProps);
  return keys.push(...Object.keys(oldProps).filter((p) => !keys.includes(p))), keys;
};
const addGlobalListener = (staticCtx, elm, prop) => {
  try {
    window.qwikevents && window.qwikevents.push(getEventName(prop));
  } catch (err) {
  }
};
const setProperties = (rctx, elCtx, newProps, isSvg) => {
  const elm = elCtx.$element$;
  const keys = Object.keys(newProps);
  const listenerMap = elCtx.li;
  if (0 === keys.length) {
    return listenerMap;
  }
  for (let key of keys) {
    if ("children" === key) {
      continue;
    }
    let newValue = newProps[key];
    if ("className" === key && (newProps.class = newValue, key = "class"), "class" === key && (newProps.class = newValue = serializeClass(newValue)), "ref" === key) {
      newValue.current = elm;
      continue;
    }
    if (isOnProp(key)) {
      addGlobalListener(rctx, elm, setEvent(listenerMap, key, newValue));
      continue;
    }
    const exception = PROP_HANDLER_MAP[key];
    exception && exception(rctx, elm, key, newValue, void 0) || (isSvg || !(key in elm) ? setAttribute(rctx, elm, key, newValue) : setProperty(rctx, elm, key, newValue));
  }
  return listenerMap;
};
const setComponentProps$1 = (ctx, rctx, expectProps) => {
  const keys = Object.keys(expectProps);
  if (0 === keys.length) {
    return false;
  }
  const qwikProps = getPropsMutator(ctx, rctx.$static$.$containerState$);
  for (const key of keys) {
    SKIPS_PROPS.includes(key) || qwikProps.set(key, expectProps[key]);
  }
  return ctx.$dirty$;
};
const cleanupTree = (parent, rctx, subsManager, stopSlots) => {
  if (stopSlots && parent.hasAttribute("q:s")) {
    return void rctx.$rmSlots$.push(parent);
  }
  cleanupElement(parent, subsManager);
  const ch = getChildren(parent, "elements");
  for (const child of ch) {
    cleanupTree(child, rctx, subsManager, stopSlots);
  }
};
const cleanupElement = (el, subsManager) => {
  const ctx = tryGetContext(el);
  ctx && cleanupContext(ctx, subsManager);
};
const directAppendChild = (parent, child) => {
  isVirtualElement(child) ? child.appendTo(parent) : parent.appendChild(child);
};
const directRemoveChild = (parent, child) => {
  isVirtualElement(child) ? child.remove() : parent.removeChild(child);
};
const directInsertBefore = (parent, child, ref) => {
  isVirtualElement(child) ? child.insertBeforeTo(parent, getRootNode(ref)) : parent.insertBefore(child, getRootNode(ref));
};
const createKeyToOldIdx = (children, beginIdx, endIdx) => {
  const map = {};
  for (let i = beginIdx; i <= endIdx; ++i) {
    const key = children[i].$key$;
    null != key && (map[key] = i);
  }
  return map;
};
const sameVnode = (vnode1, vnode2) => vnode1.$type$ === vnode2.$type$ && vnode1.$key$ === vnode2.$key$;
const isTagName = (elm, tagName) => elm.$type$ === tagName;
const useLexicalScope = () => {
  const context = getInvokeContext();
  let qrl = context.$qrl$;
  if (qrl) {
    qrl.$captureRef$;
  } else {
    const el = context.$element$;
    const container = getWrappingContainer(el);
    const ctx = getContext(el);
    qrl = parseQRL(decodeURIComponent(String(context.$url$)), container), resumeIfNeeded(container), inflateQrl(qrl, ctx);
  }
  return qrl.$captureRef$;
};
const notifyWatch = (watch, containerState) => {
  watch.$flags$ & WatchFlagsIsDirty || (watch.$flags$ |= WatchFlagsIsDirty, void 0 !== containerState.$hostsRendering$ ? (containerState.$renderPromise$, containerState.$watchStaging$.add(watch)) : (containerState.$watchNext$.add(watch), scheduleFrame(containerState)));
};
const scheduleFrame = (containerState) => (void 0 === containerState.$renderPromise$ && (containerState.$renderPromise$ = getPlatform().nextTick(() => renderMarked(containerState))), containerState.$renderPromise$);
const _hW = () => {
  const [watch] = useLexicalScope();
  notifyWatch(watch, getContainerState(getWrappingContainer(watch.$el$)));
};
const renderMarked = async (containerState) => {
  const hostsRendering = containerState.$hostsRendering$ = new Set(containerState.$hostsNext$);
  containerState.$hostsNext$.clear(), await executeWatchesBefore(containerState), containerState.$hostsStaging$.forEach((host) => {
    hostsRendering.add(host);
  }), containerState.$hostsStaging$.clear();
  const doc = getDocument(containerState.$containerEl$);
  const renderingQueue = Array.from(hostsRendering);
  sortNodes(renderingQueue);
  const ctx = createRenderContext(doc, containerState);
  const staticCtx = ctx.$static$;
  for (const el of renderingQueue) {
    if (!staticCtx.$hostElements$.has(el)) {
      const elCtx = getContext(el);
      if (elCtx.$renderQrl$) {
        el.isConnected, staticCtx.$roots$.push(elCtx);
        try {
          await renderComponent(ctx, elCtx, getFlags(el.parentElement));
        } catch (err) {
          logError(err);
        }
      }
    }
  }
  return staticCtx.$operations$.push(...staticCtx.$postOperations$), 0 === staticCtx.$operations$.length ? void postRendering(containerState, staticCtx) : getPlatform().raf(() => {
    (({ $static$: ctx2 }) => {
      executeDOMRender(ctx2);
    })(ctx), postRendering(containerState, staticCtx);
  });
};
const getFlags = (el) => {
  let flags = 0;
  return el && (el.namespaceURI === SVG_NS && (flags |= 1), "HEAD" === el.tagName && (flags |= 2)), flags;
};
const postRendering = async (containerState, ctx) => {
  await executeWatchesAfter(containerState, (watch, stage) => 0 != (watch.$flags$ & WatchFlagsIsEffect) && (!stage || ctx.$hostElements$.has(watch.$el$))), containerState.$hostsStaging$.forEach((el) => {
    containerState.$hostsNext$.add(el);
  }), containerState.$hostsStaging$.clear(), containerState.$hostsRendering$ = void 0, containerState.$renderPromise$ = void 0, containerState.$hostsNext$.size + containerState.$watchNext$.size > 0 && scheduleFrame(containerState);
};
const executeWatchesBefore = async (containerState) => {
  const resourcesPromises = [];
  const containerEl = containerState.$containerEl$;
  const watchPromises = [];
  const isWatch = (watch) => 0 != (watch.$flags$ & WatchFlagsIsWatch);
  const isResourceWatch2 = (watch) => 0 != (watch.$flags$ & WatchFlagsIsResource);
  containerState.$watchNext$.forEach((watch) => {
    isWatch(watch) && (watchPromises.push(then(watch.$qrl$.$resolveLazy$(containerEl), () => watch)), containerState.$watchNext$.delete(watch)), isResourceWatch2(watch) && (resourcesPromises.push(then(watch.$qrl$.$resolveLazy$(containerEl), () => watch)), containerState.$watchNext$.delete(watch));
  });
  do {
    if (containerState.$watchStaging$.forEach((watch) => {
      isWatch(watch) ? watchPromises.push(then(watch.$qrl$.$resolveLazy$(containerEl), () => watch)) : isResourceWatch2(watch) ? resourcesPromises.push(then(watch.$qrl$.$resolveLazy$(containerEl), () => watch)) : containerState.$watchNext$.add(watch);
    }), containerState.$watchStaging$.clear(), watchPromises.length > 0) {
      const watches = await Promise.all(watchPromises);
      sortWatches(watches), await Promise.all(watches.map((watch) => runSubscriber(watch, containerState))), watchPromises.length = 0;
    }
  } while (containerState.$watchStaging$.size > 0);
  if (resourcesPromises.length > 0) {
    const resources = await Promise.all(resourcesPromises);
    sortWatches(resources), resources.forEach((watch) => runSubscriber(watch, containerState));
  }
};
const executeWatchesAfter = async (containerState, watchPred) => {
  const watchPromises = [];
  const containerEl = containerState.$containerEl$;
  containerState.$watchNext$.forEach((watch) => {
    watchPred(watch, false) && (watchPromises.push(then(watch.$qrl$.$resolveLazy$(containerEl), () => watch)), containerState.$watchNext$.delete(watch));
  });
  do {
    if (containerState.$watchStaging$.forEach((watch) => {
      watchPred(watch, true) ? watchPromises.push(then(watch.$qrl$.$resolveLazy$(containerEl), () => watch)) : containerState.$watchNext$.add(watch);
    }), containerState.$watchStaging$.clear(), watchPromises.length > 0) {
      const watches = await Promise.all(watchPromises);
      sortWatches(watches), await Promise.all(watches.map((watch) => runSubscriber(watch, containerState))), watchPromises.length = 0;
    }
  } while (containerState.$watchStaging$.size > 0);
};
const sortNodes = (elements) => {
  elements.sort((a2, b) => 2 & a2.compareDocumentPosition(getRootNode(b)) ? 1 : -1);
};
const sortWatches = (watches) => {
  watches.sort((a2, b) => a2.$el$ === b.$el$ ? a2.$index$ < b.$index$ ? -1 : 1 : 0 != (2 & a2.$el$.compareDocumentPosition(getRootNode(b.$el$))) ? 1 : -1);
};
const CONTAINER_STATE = Symbol("ContainerState");
const getContainerState = (containerEl) => {
  let set = containerEl[CONTAINER_STATE];
  return set || (containerEl[CONTAINER_STATE] = set = createContainerState(containerEl)), set;
};
const createContainerState = (containerEl) => {
  const containerState = {
    $containerEl$: containerEl,
    $proxyMap$: /* @__PURE__ */ new WeakMap(),
    $subsManager$: null,
    $watchNext$: /* @__PURE__ */ new Set(),
    $watchStaging$: /* @__PURE__ */ new Set(),
    $hostsNext$: /* @__PURE__ */ new Set(),
    $hostsStaging$: /* @__PURE__ */ new Set(),
    $renderPromise$: void 0,
    $hostsRendering$: void 0,
    $envData$: {},
    $elementIndex$: 0,
    $styleIds$: /* @__PURE__ */ new Set(),
    $mutableProps$: false
  };
  return containerState.$subsManager$ = createSubscriptionManager(containerState), containerState;
};
const createSubscriptionManager = (containerState) => {
  const objToSubs = /* @__PURE__ */ new Map();
  const subsToObjs = /* @__PURE__ */ new Map();
  const tryGetLocal = (obj) => (getProxyTarget(obj), objToSubs.get(obj));
  const trackSubToObj = (subscriber, map) => {
    let set = subsToObjs.get(subscriber);
    set || subsToObjs.set(subscriber, set = /* @__PURE__ */ new Set()), set.add(map);
  };
  const manager = {
    $tryGetLocal$: tryGetLocal,
    $getLocal$: (obj, initialMap) => {
      let local = tryGetLocal(obj);
      if (local)
        ;
      else {
        const map = initialMap || /* @__PURE__ */ new Map();
        map.forEach((_, key) => {
          trackSubToObj(key, map);
        }), objToSubs.set(obj, local = {
          $subs$: map,
          $addSub$(subscriber, key) {
            if (null == key) {
              map.set(subscriber, null);
            } else {
              let sub = map.get(subscriber);
              void 0 === sub && map.set(subscriber, sub = /* @__PURE__ */ new Set()), sub && sub.add(key);
            }
            trackSubToObj(subscriber, map);
          },
          $notifySubs$(key) {
            map.forEach((value, subscriber) => {
              null !== value && key && !value.has(key) || ((subscriber2, containerState2) => {
                isQwikElement(subscriber2) ? ((hostElement, containerState3) => {
                  const server = isServer$1();
                  server || resumeIfNeeded(containerState3.$containerEl$);
                  const ctx = getContext(hostElement);
                  if (ctx.$renderQrl$, !ctx.$dirty$) {
                    if (ctx.$dirty$ = true, void 0 !== containerState3.$hostsRendering$) {
                      containerState3.$renderPromise$, containerState3.$hostsStaging$.add(hostElement);
                    } else {
                      if (server) {
                        return void logWarn();
                      }
                      containerState3.$hostsNext$.add(hostElement), scheduleFrame(containerState3);
                    }
                  }
                })(subscriber2, containerState2) : notifyWatch(subscriber2, containerState2);
              })(subscriber, containerState);
            });
          }
        });
      }
      return local;
    },
    $clearSub$: (sub) => {
      const subs = subsToObjs.get(sub);
      subs && (subs.forEach((s) => {
        s.delete(sub);
      }), subsToObjs.delete(sub), subs.clear());
    }
  };
  return manager;
};
const _pauseFromContexts = async (allContexts, containerState) => {
  const collector = createCollector(containerState);
  const listeners = [];
  for (const ctx of allContexts) {
    const el = ctx.$element$;
    const ctxLi = ctx.li;
    for (const key of Object.keys(ctxLi)) {
      for (const qrl of ctxLi[key]) {
        const captured = qrl.$captureRef$;
        if (captured) {
          for (const obj of captured) {
            collectValue(obj, collector, true);
          }
        }
        isElement(el) && listeners.push({
          key,
          qrl,
          el,
          eventName: getEventName(key)
        });
      }
    }
    ctx.$watches$ && collector.$watches$.push(...ctx.$watches$);
  }
  if (0 === listeners.length) {
    return {
      state: {
        ctx: {},
        objs: [],
        subs: []
      },
      objs: [],
      listeners: [],
      mode: "static"
    };
  }
  let promises;
  for (; (promises = collector.$promises$).length > 0; ) {
    collector.$promises$ = [], await Promise.allSettled(promises);
  }
  const canRender = collector.$elements$.length > 0;
  if (canRender) {
    for (const element of collector.$elements$) {
      collectElementData(tryGetContext(element), collector);
    }
    for (const ctx of allContexts) {
      if (ctx.$props$ && collectMutableProps(ctx.$element$, ctx.$props$, collector), ctx.$contexts$) {
        for (const item of ctx.$contexts$.values()) {
          collectValue(item, collector, false);
        }
      }
    }
  }
  for (; (promises = collector.$promises$).length > 0; ) {
    collector.$promises$ = [], await Promise.allSettled(promises);
  }
  const elementToIndex = /* @__PURE__ */ new Map();
  const objs = Array.from(collector.$objSet$.keys());
  const objToId = /* @__PURE__ */ new Map();
  const getElementID = (el) => {
    let id = elementToIndex.get(el);
    return void 0 === id && (id = ((el2) => {
      const ctx = tryGetContext(el2);
      return ctx ? ctx.$id$ : null;
    })(el), id ? id = "#" + id : console.warn("Missing ID", el), elementToIndex.set(el, id)), id;
  };
  const getObjId = (obj) => {
    let suffix = "";
    if (isMutable(obj) && (obj = obj.mut, suffix = "%"), isPromise(obj)) {
      const { value, resolved } = getPromiseValue(obj);
      obj = value, suffix += resolved ? "~" : "_";
    }
    if (isObject(obj)) {
      const target = getProxyTarget(obj);
      if (target) {
        suffix += "!", obj = target;
      } else if (isQwikElement(obj)) {
        const elID = getElementID(obj);
        return elID ? elID + suffix : null;
      }
    }
    const id = objToId.get(obj);
    return id ? id + suffix : null;
  };
  const mustGetObjId = (obj) => {
    const key = getObjId(obj);
    if (null === key) {
      throw qError(QError_missingObjectId, obj);
    }
    return key;
  };
  const subsMap = /* @__PURE__ */ new Map();
  objs.forEach((obj) => {
    const proxy = containerState.$proxyMap$.get(obj);
    const flags = getProxyFlags(proxy);
    if (void 0 === flags) {
      return;
    }
    const subsObj = [];
    flags > 0 && subsObj.push({
      subscriber: "$",
      data: flags
    }), getProxySubs(proxy).forEach((set, key) => {
      isNode(key) && isVirtualElement(key) && !collector.$elements$.includes(key) || subsObj.push({
        subscriber: key,
        data: set ? Array.from(set) : null
      });
    }), subsObj.length > 0 && subsMap.set(obj, subsObj);
  }), objs.sort((a2, b) => (subsMap.has(a2) ? 0 : 1) - (subsMap.has(b) ? 0 : 1));
  let count = 0;
  for (const obj of objs) {
    objToId.set(obj, intToStr(count)), count++;
  }
  if (collector.$noSerialize$.length > 0) {
    const undefinedID = objToId.get(void 0);
    for (const obj of collector.$noSerialize$) {
      objToId.set(obj, undefinedID);
    }
  }
  const subs = objs.map((obj) => {
    const sub = subsMap.get(obj);
    if (!sub) {
      return;
    }
    const subsObj = {};
    return sub.forEach(({ subscriber, data }) => {
      if ("$" === subscriber) {
        subsObj[subscriber] = data;
      } else {
        const id = getObjId(subscriber);
        null !== id && (subsObj[id] = data);
      }
    }), subsObj;
  }).filter(isNotNullable);
  const convertedObjs = objs.map((obj) => {
    if (null === obj) {
      return null;
    }
    const typeObj = typeof obj;
    switch (typeObj) {
      case "undefined":
        return UNDEFINED_PREFIX;
      case "string":
      case "number":
      case "boolean":
        return obj;
      default:
        const value = serializeValue(obj, getObjId, containerState);
        if (void 0 !== value) {
          return value;
        }
        if ("object" === typeObj) {
          if (isArray(obj)) {
            return obj.map(mustGetObjId);
          }
          if (isSerializableObject(obj)) {
            const output = {};
            for (const key of Object.keys(obj)) {
              output[key] = mustGetObjId(obj[key]);
            }
            return output;
          }
        }
    }
    throw qError(QError_verifySerializable, obj);
  });
  const meta = {};
  allContexts.forEach((ctx) => {
    const node = ctx.$element$;
    const ref = ctx.$refMap$;
    const props = ctx.$props$;
    const contexts = ctx.$contexts$;
    const watches = ctx.$watches$;
    const renderQrl = ctx.$renderQrl$;
    const seq = ctx.$seq$;
    const metaValue = {};
    const elementCaptured = isVirtualElement(node) && collector.$elements$.includes(node);
    let add = false;
    if (ref.length > 0) {
      const value = ref.map(mustGetObjId).join(" ");
      value && (metaValue.r = value, add = true);
    }
    if (canRender) {
      if (elementCaptured && props && (metaValue.h = mustGetObjId(props) + " " + mustGetObjId(renderQrl), add = true), watches && watches.length > 0) {
        const value = watches.map(getObjId).filter(isNotNullable).join(" ");
        value && (metaValue.w = value, add = true);
      }
      if (elementCaptured && seq && seq.length > 0) {
        const value = seq.map(mustGetObjId).join(" ");
        metaValue.s = value, add = true;
      }
      if (contexts) {
        const serializedContexts = [];
        contexts.forEach((value2, key) => {
          serializedContexts.push(`${key}=${mustGetObjId(value2)}`);
        });
        const value = serializedContexts.join(" ");
        value && (metaValue.c = value, add = true);
      }
    }
    if (add) {
      const elementID = getElementID(node);
      meta[elementID] = metaValue;
    }
  });
  for (const watch of collector.$watches$) {
    destroyWatch(watch);
  }
  return {
    state: {
      ctx: meta,
      objs: convertedObjs,
      subs
    },
    objs,
    listeners,
    mode: canRender ? "render" : "listeners"
  };
};
const getNodesInScope = (parent, predicate) => {
  predicate(parent);
  const walker = parent.ownerDocument.createTreeWalker(parent, 129, {
    acceptNode: (node) => isContainer(node) ? 2 : predicate(node) ? 1 : 3
  });
  const pars = [];
  let currentNode = null;
  for (; currentNode = walker.nextNode(); ) {
    pars.push(processVirtualNodes(currentNode));
  }
  return pars;
};
const reviveNestedObjects = (obj, getObject, parser) => {
  if (!parser.fill(obj) && obj && "object" == typeof obj) {
    if (isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        const value = obj[i];
        "string" == typeof value ? obj[i] = getObject(value) : reviveNestedObjects(value, getObject, parser);
      }
    } else if (isSerializableObject(obj)) {
      for (const key of Object.keys(obj)) {
        const value = obj[key];
        "string" == typeof value ? obj[key] = getObject(value) : reviveNestedObjects(value, getObject, parser);
      }
    }
  }
};
const OBJECT_TRANSFORMS = {
  "!": (obj, containerState) => {
    var _a2;
    return (_a2 = containerState.$proxyMap$.get(obj)) != null ? _a2 : getOrCreateProxy(obj, containerState);
  },
  "%": (obj) => mutable(obj),
  "~": (obj) => Promise.resolve(obj),
  _: (obj) => Promise.reject(obj)
};
const collectMutableProps = (el, props, collector) => {
  const subs = getProxySubs(props);
  subs && subs.has(el) && collectElement(el, collector);
};
const createCollector = (containerState) => ({
  $containerState$: containerState,
  $seen$: /* @__PURE__ */ new Set(),
  $objSet$: /* @__PURE__ */ new Set(),
  $noSerialize$: [],
  $elements$: [],
  $watches$: [],
  $promises$: []
});
const collectDeferElement = (el, collector) => {
  collector.$elements$.includes(el) || collector.$elements$.push(el);
};
const collectElement = (el, collector) => {
  if (collector.$elements$.includes(el)) {
    return;
  }
  const ctx = tryGetContext(el);
  ctx && (collector.$elements$.push(el), collectElementData(ctx, collector));
};
const collectElementData = (ctx, collector) => {
  if (ctx.$props$ && collectValue(ctx.$props$, collector, false), ctx.$renderQrl$ && collectValue(ctx.$renderQrl$, collector, false), ctx.$seq$) {
    for (const obj of ctx.$seq$) {
      collectValue(obj, collector, false);
    }
  }
  if (ctx.$watches$) {
    for (const obj of ctx.$watches$) {
      collectValue(obj, collector, false);
    }
  }
  if (ctx.$contexts$) {
    for (const obj of ctx.$contexts$.values()) {
      collectValue(obj, collector, false);
    }
  }
};
const PROMISE_VALUE = Symbol();
const getPromiseValue = (promise) => promise[PROMISE_VALUE];
const collectValue = (obj, collector, leaks) => {
  if (null !== obj) {
    const objType = typeof obj;
    const seen = collector.$seen$;
    switch (objType) {
      case "function":
        if (seen.has(obj)) {
          return;
        }
        if (seen.add(obj), !fastShouldSerialize(obj)) {
          return collector.$objSet$.add(void 0), void collector.$noSerialize$.push(obj);
        }
        if (isQrl$1(obj)) {
          if (collector.$objSet$.add(obj), obj.$captureRef$) {
            for (const item of obj.$captureRef$) {
              collectValue(item, collector, leaks);
            }
          }
          return;
        }
        break;
      case "object": {
        if (seen.has(obj)) {
          return;
        }
        if (seen.add(obj), !fastShouldSerialize(obj)) {
          return collector.$objSet$.add(void 0), void collector.$noSerialize$.push(obj);
        }
        if (isPromise(obj)) {
          return void collector.$promises$.push((promise = obj, promise.then((value) => {
            const v = {
              resolved: true,
              value
            };
            return promise[PROMISE_VALUE] = v, value;
          }, (value) => {
            const v = {
              resolved: false,
              value
            };
            return promise[PROMISE_VALUE] = v, value;
          })).then((value) => {
            collectValue(value, collector, leaks);
          }));
        }
        const target = getProxyTarget(obj);
        const input = obj;
        if (target) {
          if (leaks && ((proxy, collector2) => {
            const subs = getProxySubs(proxy);
            if (!collector2.$seen$.has(subs)) {
              collector2.$seen$.add(subs);
              for (const key of Array.from(subs.keys())) {
                isNode(key) && isVirtualElement(key) ? collectDeferElement(key, collector2) : collectValue(key, collector2, true);
              }
            }
          })(input, collector), obj = target, seen.has(obj)) {
            return;
          }
          if (seen.add(obj), isResourceReturn(obj)) {
            return collector.$objSet$.add(target), collectValue(obj.promise, collector, leaks), void collectValue(obj.resolved, collector, leaks);
          }
        } else if (isNode(obj)) {
          return;
        }
        if (isArray(obj)) {
          for (let i = 0; i < obj.length; i++) {
            collectValue(input[i], collector, leaks);
          }
        } else {
          for (const key of Object.keys(obj)) {
            collectValue(input[key], collector, leaks);
          }
        }
        break;
      }
    }
  }
  var promise;
  collector.$objSet$.add(obj);
};
const isContainer = (el) => isElement(el) && el.hasAttribute("q:container");
const hasQId = (el) => {
  const node = processVirtualNodes(el);
  return !!isQwikElement(node) && node.hasAttribute("q:id");
};
const intToStr = (nu) => nu.toString(36);
const strToInt = (nu) => parseInt(nu, 36);
const getEventName = (attribute) => {
  const colonPos = attribute.indexOf(":");
  return attribute.slice(colonPos + 1).replace(/-./g, (x) => x[1].toUpperCase());
};
const WatchFlagsIsEffect = 1;
const WatchFlagsIsWatch = 2;
const WatchFlagsIsDirty = 4;
const WatchFlagsIsCleanup = 8;
const WatchFlagsIsResource = 16;
const useWatchQrl = (qrl, opts) => {
  const { get, set, ctx, i } = useSequentialScope();
  if (get) {
    return;
  }
  const el = ctx.$hostElement$;
  const containerState = ctx.$renderCtx$.$static$.$containerState$;
  const watch = new Watch(WatchFlagsIsDirty | WatchFlagsIsWatch, i, el, qrl, void 0);
  const elCtx = getContext(el);
  set(true), qrl.$resolveLazy$(containerState.$containerEl$), elCtx.$watches$ || (elCtx.$watches$ = []), elCtx.$watches$.push(watch), waitAndRun(ctx, () => runSubscriber(watch, containerState, ctx.$renderCtx$)), isServer$1() && useRunWatch(watch, opts == null ? void 0 : opts.eagerness);
};
const useMountQrl = (mountQrl) => {
  const { get, set, ctx } = useSequentialScope();
  get || (mountQrl.$resolveLazy$(ctx.$renderCtx$.$static$.$containerState$.$containerEl$), waitAndRun(ctx, mountQrl), set(true));
};
const isResourceWatch = (watch) => !!watch.$resource$;
const runSubscriber = (watch, containerState, rctx) => (watch.$flags$, isResourceWatch(watch) ? runResource(watch, containerState) : runWatch(watch, containerState, rctx));
const runResource = (watch, containerState, waitOn) => {
  watch.$flags$ &= ~WatchFlagsIsDirty, cleanupWatch(watch);
  const el = watch.$el$;
  const invokationContext = newInvokeContext(el, void 0, "WatchEvent");
  const { $subsManager$: subsManager } = containerState;
  const watchFn = watch.$qrl$.getFn(invokationContext, () => {
    subsManager.$clearSub$(watch);
  });
  const cleanups = [];
  const resource = watch.$resource$;
  const resourceTarget = unwrapProxy(resource);
  const opts = {
    track: (obj, prop) => {
      const target = getProxyTarget(obj);
      return target ? subsManager.$getLocal$(target).$addSub$(watch, prop) : logErrorAndStop(codeToText(QError_trackUseStore), obj), prop ? obj[prop] : obj;
    },
    cleanup(callback) {
      cleanups.push(callback);
    },
    previous: resourceTarget.resolved
  };
  let resolve;
  let reject;
  let done = false;
  const setState = (resolved, value) => !done && (done = true, resolved ? (done = true, resource.state = "resolved", resource.resolved = value, resource.error = void 0, resolve(value)) : (done = true, resource.state = "rejected", resource.resolved = void 0, resource.error = value, reject(value)), true);
  invoke(invokationContext, () => {
    resource.state = "pending", resource.resolved = void 0, resource.promise = new Promise((r, re) => {
      resolve = r, reject = re;
    });
  }), watch.$destroy$ = noSerialize(() => {
    cleanups.forEach((fn) => fn());
  });
  const promise = safeCall(() => then(waitOn, () => watchFn(opts)), (value) => {
    setState(true, value);
  }, (reason) => {
    setState(false, reason);
  });
  const timeout = resourceTarget.timeout;
  return timeout ? Promise.race([promise, delay(timeout).then(() => {
    setState(false, "timeout") && cleanupWatch(watch);
  })]) : promise;
};
const runWatch = (watch, containerState, rctx) => {
  watch.$flags$ &= ~WatchFlagsIsDirty, cleanupWatch(watch);
  const hostElement = watch.$el$;
  const invokationContext = newInvokeContext(hostElement, void 0, "WatchEvent");
  const { $subsManager$: subsManager } = containerState;
  const watchFn = watch.$qrl$.getFn(invokationContext, () => {
    subsManager.$clearSub$(watch);
  });
  const cleanups = [];
  watch.$destroy$ = noSerialize(() => {
    cleanups.forEach((fn) => fn());
  });
  const opts = {
    track: (obj, prop) => {
      const target = getProxyTarget(obj);
      return target ? subsManager.$getLocal$(target).$addSub$(watch, prop) : logErrorAndStop(codeToText(QError_trackUseStore), obj), prop ? obj[prop] : obj;
    },
    cleanup(callback) {
      cleanups.push(callback);
    }
  };
  return safeCall(() => watchFn(opts), (returnValue) => {
    isFunction(returnValue) && cleanups.push(returnValue);
  }, (reason) => {
    handleError(reason, hostElement, rctx);
  });
};
const cleanupWatch = (watch) => {
  const destroy = watch.$destroy$;
  if (destroy) {
    watch.$destroy$ = void 0;
    try {
      destroy();
    } catch (err) {
      logError(err);
    }
  }
};
const destroyWatch = (watch) => {
  watch.$flags$ & WatchFlagsIsCleanup ? (watch.$flags$ &= ~WatchFlagsIsCleanup, (0, watch.$qrl$)()) : cleanupWatch(watch);
};
const useRunWatch = (watch, eagerness) => {
  "load" === eagerness ? useOn("qinit", getWatchHandlerQrl(watch)) : "visible" === eagerness && useOn("qvisible", getWatchHandlerQrl(watch));
};
const getWatchHandlerQrl = (watch) => {
  const watchQrl = watch.$qrl$;
  return createQRL(watchQrl.$chunk$, "_hW", _hW, null, null, [watch], watchQrl.$symbol$);
};
class Watch {
  constructor($flags$, $index$, $el$, $qrl$, $resource$) {
    this.$flags$ = $flags$, this.$index$ = $index$, this.$el$ = $el$, this.$qrl$ = $qrl$, this.$resource$ = $resource$;
  }
}
const _createResourceReturn = (opts) => ({
  __brand: "resource",
  promise: void 0,
  resolved: void 0,
  error: void 0,
  state: "pending",
  timeout: opts == null ? void 0 : opts.timeout
});
const isResourceReturn = (obj) => isObject(obj) && "resource" === obj.__brand;
const UNDEFINED_PREFIX = "";
const QRLSerializer = {
  prefix: "",
  test: (v) => isQrl$1(v),
  serialize: (obj, getObjId, containerState) => stringifyQRL(obj, {
    $getObjId$: getObjId
  }),
  prepare: (data, containerState) => parseQRL(data, containerState.$containerEl$),
  fill: (qrl, getObject) => {
    qrl.$capture$ && qrl.$capture$.length > 0 && (qrl.$captureRef$ = qrl.$capture$.map(getObject), qrl.$capture$ = null);
  }
};
const WatchSerializer = {
  prefix: "",
  test: (v) => {
    return isObject(obj = v) && obj instanceof Watch;
    var obj;
  },
  serialize: (obj, getObjId) => ((watch, getObjId2) => {
    let value = `${intToStr(watch.$flags$)} ${intToStr(watch.$index$)} ${getObjId2(watch.$qrl$)} ${getObjId2(watch.$el$)}`;
    return isResourceWatch(watch) && (value += ` ${getObjId2(watch.$resource$)}`), value;
  })(obj, getObjId),
  prepare: (data) => ((data2) => {
    const [flags, index2, qrl, el, resource] = data2.split(" ");
    return new Watch(strToInt(flags), strToInt(index2), el, qrl, resource);
  })(data),
  fill: (watch, getObject) => {
    watch.$el$ = getObject(watch.$el$), watch.$qrl$ = getObject(watch.$qrl$), watch.$resource$ && (watch.$resource$ = getObject(watch.$resource$));
  }
};
const ResourceSerializer = {
  prefix: "",
  test: (v) => isResourceReturn(v),
  serialize: (obj, getObjId) => ((resource, getObjId2) => {
    const state = resource.state;
    return "resolved" === state ? `0 ${getObjId2(resource.resolved)}` : "pending" === state ? "1" : `2 ${getObjId2(resource.error)}`;
  })(obj, getObjId),
  prepare: (data) => ((data2) => {
    const [first, id] = data2.split(" ");
    const result = _createResourceReturn(void 0);
    return result.promise = Promise.resolve(), "0" === first ? (result.state = "resolved", result.resolved = id) : "1" === first ? (result.state = "pending", result.promise = new Promise(() => {
    })) : "2" === first && (result.state = "rejected", result.error = id), result;
  })(data),
  fill: (resource, getObject) => {
    if ("resolved" === resource.state) {
      resource.resolved = getObject(resource.resolved), resource.promise = Promise.resolve(resource.resolved);
    } else if ("rejected" === resource.state) {
      const p = Promise.reject(resource.error);
      p.catch(() => null), resource.error = getObject(resource.error), resource.promise = p;
    }
  }
};
const URLSerializer = {
  prefix: "",
  test: (v) => v instanceof URL,
  serialize: (obj) => obj.href,
  prepare: (data) => new URL(data),
  fill: void 0
};
const DateSerializer = {
  prefix: "",
  test: (v) => v instanceof Date,
  serialize: (obj) => obj.toISOString(),
  prepare: (data) => new Date(data),
  fill: void 0
};
const RegexSerializer = {
  prefix: "\x07",
  test: (v) => v instanceof RegExp,
  serialize: (obj) => `${obj.flags} ${obj.source}`,
  prepare: (data) => {
    const space = data.indexOf(" ");
    const source = data.slice(space + 1);
    const flags = data.slice(0, space);
    return new RegExp(source, flags);
  },
  fill: void 0
};
const ErrorSerializer = {
  prefix: "",
  test: (v) => v instanceof Error,
  serialize: (obj) => obj.message,
  prepare: (text) => {
    const err = new Error(text);
    return err.stack = void 0, err;
  },
  fill: void 0
};
const DocumentSerializer = {
  prefix: "",
  test: (v) => isDocument(v),
  serialize: void 0,
  prepare: (_, _c, doc) => doc,
  fill: void 0
};
const SERIALIZABLE_STATE = Symbol("serializable-data");
const ComponentSerializer = {
  prefix: "",
  test: (obj) => isQwikComponent(obj),
  serialize: (obj, getObjId, containerState) => {
    const [qrl] = obj[SERIALIZABLE_STATE];
    return stringifyQRL(qrl, {
      $getObjId$: getObjId
    });
  },
  prepare: (data, containerState) => {
    const optionsIndex = data.indexOf("{");
    const qrlString = -1 == optionsIndex ? data : data.slice(0, optionsIndex);
    const qrl = parseQRL(qrlString, containerState.$containerEl$);
    return componentQrl(qrl);
  },
  fill: (component, getObject) => {
    const [qrl] = component[SERIALIZABLE_STATE];
    qrl.$capture$ && qrl.$capture$.length > 0 && (qrl.$captureRef$ = qrl.$capture$.map(getObject), qrl.$capture$ = null);
  }
};
const serializers = [QRLSerializer, WatchSerializer, ResourceSerializer, URLSerializer, DateSerializer, RegexSerializer, ErrorSerializer, DocumentSerializer, ComponentSerializer, {
  prefix: "",
  test: (obj) => "function" == typeof obj && void 0 !== obj.__qwik_serializable__,
  serialize: (obj) => obj.toString(),
  prepare: (data) => {
    const fn = new Function("return " + data)();
    return fn.__qwik_serializable__ = true, fn;
  },
  fill: void 0
}];
const serializeValue = (obj, getObjID, containerState) => {
  for (const s of serializers) {
    if (s.test(obj)) {
      let value = s.prefix;
      return s.serialize && (value += s.serialize(obj, getObjID, containerState)), value;
    }
  }
};
const getOrCreateProxy = (target, containerState, flags = 0) => containerState.$proxyMap$.get(target) || createProxy(target, containerState, flags, void 0);
const createProxy = (target, containerState, flags, subs) => {
  unwrapProxy(target), containerState.$proxyMap$.has(target);
  const manager = containerState.$subsManager$.$getLocal$(target, subs);
  const proxy = new Proxy(target, new ReadWriteProxyHandler(containerState, manager, flags));
  return containerState.$proxyMap$.set(target, proxy), proxy;
};
const QOjectTargetSymbol = Symbol();
const QOjectSubsSymbol = Symbol();
const QOjectFlagsSymbol = Symbol();
class ReadWriteProxyHandler {
  constructor($containerState$, $manager$, $flags$) {
    this.$containerState$ = $containerState$, this.$manager$ = $manager$, this.$flags$ = $flags$;
  }
  get(target, prop) {
    if ("symbol" == typeof prop) {
      return prop === QOjectTargetSymbol ? target : prop === QOjectFlagsSymbol ? this.$flags$ : prop === QOjectSubsSymbol ? this.$manager$.$subs$ : target[prop];
    }
    let subscriber;
    const invokeCtx = tryGetInvokeContext();
    const recursive = 0 != (1 & this.$flags$);
    const immutable = 0 != (2 & this.$flags$);
    invokeCtx && (subscriber = invokeCtx.$subscriber$);
    let value = target[prop];
    if (isMutable(value) ? value = value.mut : immutable && (subscriber = null), subscriber) {
      const isA = isArray(target);
      this.$manager$.$addSub$(subscriber, isA ? void 0 : prop);
    }
    return recursive ? wrap(value, this.$containerState$) : value;
  }
  set(target, prop, newValue) {
    if ("symbol" == typeof prop) {
      return target[prop] = newValue, true;
    }
    if (0 != (2 & this.$flags$)) {
      throw qError(QError_immutableProps);
    }
    const unwrappedNewValue = 0 != (1 & this.$flags$) ? unwrapProxy(newValue) : newValue;
    return isArray(target) ? (target[prop] = unwrappedNewValue, this.$manager$.$notifySubs$(), true) : (target[prop] !== unwrappedNewValue && (target[prop] = unwrappedNewValue, this.$manager$.$notifySubs$(prop)), true);
  }
  has(target, property) {
    return property === QOjectTargetSymbol || property === QOjectFlagsSymbol || Object.prototype.hasOwnProperty.call(target, property);
  }
  ownKeys(target) {
    let subscriber = null;
    const invokeCtx = tryGetInvokeContext();
    return invokeCtx && (subscriber = invokeCtx.$subscriber$), subscriber && this.$manager$.$addSub$(subscriber), Object.getOwnPropertyNames(target);
  }
}
const wrap = (value, containerState) => {
  if (isQrl$1(value)) {
    return value;
  }
  if (isObject(value)) {
    if (Object.isFrozen(value)) {
      return value;
    }
    const nakedValue = unwrapProxy(value);
    return nakedValue !== value || isNode(nakedValue) ? value : shouldSerialize(nakedValue) ? containerState.$proxyMap$.get(value) || getOrCreateProxy(value, containerState, 1) : value;
  }
  return value;
};
const noSerializeSet = /* @__PURE__ */ new WeakSet();
const shouldSerialize = (obj) => !isObject(obj) && !isFunction(obj) || !noSerializeSet.has(obj);
const fastShouldSerialize = (obj) => !noSerializeSet.has(obj);
const noSerialize = (input) => (null != input && noSerializeSet.add(input), input);
const mutable = (v) => new MutableImpl(v);
class MutableImpl {
  constructor(mut) {
    this.mut = mut;
  }
}
const isMutable = (v) => v instanceof MutableImpl;
const unwrapProxy = (proxy) => {
  var _a2;
  return isObject(proxy) ? (_a2 = getProxyTarget(proxy)) != null ? _a2 : proxy : proxy;
};
const getProxyTarget = (obj) => obj[QOjectTargetSymbol];
const getProxySubs = (obj) => obj[QOjectSubsSymbol];
const getProxyFlags = (obj) => {
  if (isObject(obj)) {
    return obj[QOjectFlagsSymbol];
  }
};
const resumeIfNeeded = (containerEl) => {
  "paused" === directGetAttribute(containerEl, "q:container") && (((containerEl2) => {
    if (!isContainer(containerEl2)) {
      return void logWarn();
    }
    const doc = getDocument(containerEl2);
    const script = ((parentElm) => {
      let child = parentElm.lastElementChild;
      for (; child; ) {
        if ("SCRIPT" === child.tagName && "qwik/json" === directGetAttribute(child, "type")) {
          return child;
        }
        child = child.previousElementSibling;
      }
    })(containerEl2 === doc.documentElement ? doc.body : containerEl2);
    if (!script) {
      return void logWarn();
    }
    script.remove();
    const containerState = getContainerState(containerEl2);
    ((containerEl3, containerState2) => {
      const head2 = containerEl3.ownerDocument.head;
      containerEl3.querySelectorAll("style[q\\:style]").forEach((el2) => {
        containerState2.$styleIds$.add(directGetAttribute(el2, "q:style")), head2.appendChild(el2);
      });
    })(containerEl2, containerState);
    const meta = JSON.parse((script.textContent || "{}").replace(/\\x3C(\/?script)/g, "<$1"));
    const elements = /* @__PURE__ */ new Map();
    const getObject = (id) => ((id2, elements2, objs, containerState2) => {
      if ("string" == typeof id2 && id2.length, id2.startsWith("#")) {
        return elements2.has(id2), elements2.get(id2);
      }
      const index2 = strToInt(id2);
      objs.length;
      let obj = objs[index2];
      for (let i = id2.length - 1; i >= 0; i--) {
        const code = id2[i];
        const transform = OBJECT_TRANSFORMS[code];
        if (!transform) {
          break;
        }
        obj = transform(obj, containerState2);
      }
      return obj;
    })(id, elements, meta.objs, containerState);
    let maxId = 0;
    getNodesInScope(containerEl2, hasQId).forEach((el2) => {
      const id = directGetAttribute(el2, "q:id");
      const ctx = getContext(el2);
      ctx.$id$ = id, isElement(el2) && (ctx.$vdom$ = domToVnode(el2)), elements.set("#" + id, el2), maxId = Math.max(maxId, strToInt(id));
    }), containerState.$elementIndex$ = ++maxId;
    const parser = ((getObject2, containerState2, doc2) => {
      const map = /* @__PURE__ */ new Map();
      return {
        prepare(data) {
          for (const s of serializers) {
            const prefix = s.prefix;
            if (data.startsWith(prefix)) {
              const value = s.prepare(data.slice(prefix.length), containerState2, doc2);
              return s.fill && map.set(value, s), value;
            }
          }
          return data;
        },
        fill(obj) {
          const serializer = map.get(obj);
          return !!serializer && (serializer.fill(obj, getObject2, containerState2), true);
        }
      };
    })(getObject, containerState, doc);
    ((objs, subs, getObject2, containerState2, parser2) => {
      for (let i = 0; i < objs.length; i++) {
        const value = objs[i];
        isString(value) && (objs[i] = value === UNDEFINED_PREFIX ? void 0 : parser2.prepare(value));
      }
      for (let i = 0; i < subs.length; i++) {
        const value = objs[i];
        const sub = subs[i];
        if (sub) {
          const converted = /* @__PURE__ */ new Map();
          let flags = 0;
          for (const key of Object.keys(sub)) {
            const v = sub[key];
            if ("$" === key) {
              flags = v;
              continue;
            }
            const el2 = getObject2(key);
            if (!el2) {
              continue;
            }
            const set = null === v ? null : new Set(v);
            converted.set(el2, set);
          }
          createProxy(value, containerState2, flags, converted);
        }
      }
    })(meta.objs, meta.subs, getObject, containerState, parser);
    for (const obj of meta.objs) {
      reviveNestedObjects(obj, getObject, parser);
    }
    for (const elementID of Object.keys(meta.ctx)) {
      elementID.startsWith("#");
      const ctxMeta = meta.ctx[elementID];
      const el2 = elements.get(elementID);
      const ctx = getContext(el2);
      const refMap = ctxMeta.r;
      const seq = ctxMeta.s;
      const host = ctxMeta.h;
      const contexts = ctxMeta.c;
      const watches = ctxMeta.w;
      if (refMap && (isElement(el2), ctx.$refMap$ = refMap.split(" ").map(getObject), ctx.li = getDomListeners(ctx, containerEl2)), seq && (ctx.$seq$ = seq.split(" ").map(getObject)), watches && (ctx.$watches$ = watches.split(" ").map(getObject)), contexts) {
        ctx.$contexts$ = /* @__PURE__ */ new Map();
        for (const part of contexts.split(" ")) {
          const [key, value] = part.split("=");
          ctx.$contexts$.set(key, getObject(value));
        }
      }
      if (host) {
        const [props, renderQrl] = host.split(" ");
        const styleIds = el2.getAttribute("q:sstyle");
        ctx.$scopeIds$ = styleIds ? styleIds.split(" ") : null, ctx.$mounted$ = true, ctx.$props$ = getObject(props), ctx.$renderQrl$ = getObject(renderQrl);
      }
    }
    var el;
    directSetAttribute(containerEl2, "q:container", "resumed"), (el = containerEl2) && "function" == typeof CustomEvent && el.dispatchEvent(new CustomEvent("qresume", {
      detail: void 0,
      bubbles: true,
      composed: true
    }));
  })(containerEl), appendQwikDevTools(containerEl));
};
const appendQwikDevTools = (containerEl) => {
  containerEl.qwik = {
    pause: () => (async (elmOrDoc, defaultParentJSON) => {
      const doc = getDocument(elmOrDoc);
      const documentElement = doc.documentElement;
      const containerEl2 = isDocument(elmOrDoc) ? documentElement : elmOrDoc;
      if ("paused" === directGetAttribute(containerEl2, "q:container")) {
        throw qError(QError_containerAlreadyPaused);
      }
      const parentJSON = containerEl2 === doc.documentElement ? doc.body : containerEl2;
      const data = await (async (containerEl3) => {
        const containerState = getContainerState(containerEl3);
        const contexts = getNodesInScope(containerEl3, hasQId).map(tryGetContext);
        return _pauseFromContexts(contexts, containerState);
      })(containerEl2);
      const script = doc.createElement("script");
      return directSetAttribute(script, "type", "qwik/json"), script.textContent = JSON.stringify(data.state, void 0, void 0).replace(/<(\/?script)/g, "\\x3C$1"), parentJSON.appendChild(script), directSetAttribute(containerEl2, "q:container", "paused"), data;
    })(containerEl),
    state: getContainerState(containerEl)
  };
};
const tryGetContext = (element) => element._qc_;
const getContext = (element) => {
  let ctx = tryGetContext(element);
  return ctx || (element._qc_ = ctx = {
    $dirty$: false,
    $mounted$: false,
    $attachedListeners$: false,
    $id$: "",
    $element$: element,
    $refMap$: [],
    li: {},
    $watches$: null,
    $seq$: null,
    $slots$: null,
    $scopeIds$: null,
    $appendStyles$: null,
    $props$: null,
    $vdom$: null,
    $renderQrl$: null,
    $contexts$: null
  }), ctx;
};
const cleanupContext = (ctx, subsManager) => {
  var _a2;
  const el = ctx.$element$;
  (_a2 = ctx.$watches$) == null ? void 0 : _a2.forEach((watch) => {
    subsManager.$clearSub$(watch), destroyWatch(watch);
  }), ctx.$renderQrl$ && subsManager.$clearSub$(el), ctx.$renderQrl$ = null, ctx.$seq$ = null, ctx.$watches$ = null, ctx.$dirty$ = false, el._qc_ = void 0;
};
const PREFIXES = ["on", "window:on", "document:on"];
const SCOPED = ["on", "on-window", "on-document"];
const normalizeOnProp = (prop) => {
  let scope = "on";
  for (let i = 0; i < PREFIXES.length; i++) {
    const prefix = PREFIXES[i];
    if (prop.startsWith(prefix)) {
      scope = SCOPED[i], prop = prop.slice(prefix.length);
      break;
    }
  }
  return scope + ":" + (prop.startsWith("-") ? fromCamelToKebabCase(prop.slice(1)) : prop.toLowerCase());
};
const createProps = (target, containerState) => createProxy(target, containerState, 2);
const getPropsMutator = (ctx, containerState) => {
  let props = ctx.$props$;
  props || (ctx.$props$ = props = createProps({}, containerState));
  const target = getProxyTarget(props);
  const manager = containerState.$subsManager$.$getLocal$(target);
  return {
    set(prop, value) {
      let oldValue = target[prop];
      isMutable(oldValue) && (oldValue = oldValue.mut), containerState.$mutableProps$ ? isMutable(value) ? (value = value.mut, target[prop] = value) : target[prop] = mutable(value) : (target[prop] = value, isMutable(value) && (value = value.mut, true)), oldValue !== value && manager.$notifySubs$(prop);
    }
  };
};
const inflateQrl = (qrl, elCtx) => (qrl.$capture$, qrl.$captureRef$ = qrl.$capture$.map((idx) => {
  const int = parseInt(idx, 10);
  const obj = elCtx.$refMap$[int];
  return elCtx.$refMap$.length, obj;
}));
const logError = (message, ...optionalParams) => {
  const err = message instanceof Error ? message : new Error(message);
  return "function" == typeof globalThis._handleError && message instanceof Error ? globalThis._handleError(message, optionalParams) : console.error("%cQWIK ERROR", "", err.message, ...printParams(optionalParams), err.stack), err;
};
const logErrorAndStop = (message, ...optionalParams) => logError(message, ...optionalParams);
const logWarn = (message, ...optionalParams) => {
};
const printParams = (optionalParams) => optionalParams;
const QError_stringifyClassOrStyle = 0;
const QError_verifySerializable = 3;
const QError_setProperty = 6;
const QError_notFoundContext = 13;
const QError_useMethodOutsideContext = 14;
const QError_immutableProps = 17;
const QError_useInvokeContext = 20;
const QError_containerAlreadyPaused = 21;
const QError_invalidJsxNodeType = 25;
const QError_trackUseStore = 26;
const QError_missingObjectId = 27;
const qError = (code, ...parts) => {
  const text = codeToText(code);
  return logErrorAndStop(text, ...parts);
};
const codeToText = (code) => `Code(${code})`;
const isQrl$1 = (value) => "function" == typeof value && "function" == typeof value.getSymbol;
const createQRL = (chunk, symbol, symbolRef, symbolFn, capture, captureRef, refSymbol) => {
  let _containerEl;
  const setContainer = (el) => {
    _containerEl || (_containerEl = el);
  };
  const resolve = async (containerEl) => {
    if (containerEl && setContainer(containerEl), symbolRef) {
      return symbolRef;
    }
    if (symbolFn) {
      return symbolRef = symbolFn().then((module) => symbolRef = module[symbol]);
    }
    {
      if (!_containerEl) {
        throw new Error(`QRL '${chunk}#${symbol || "default"}' does not have an attached container`);
      }
      const symbol2 = getPlatform().importSymbol(_containerEl, chunk, symbol);
      return symbolRef = then(symbol2, (ref) => symbolRef = ref);
    }
  };
  const resolveLazy = (containerEl) => symbolRef || resolve(containerEl);
  const invokeFn = (currentCtx, beforeFn) => (...args) => {
    const fn = resolveLazy();
    return then(fn, (fn2) => {
      if (isFunction(fn2)) {
        if (beforeFn && false === beforeFn()) {
          return;
        }
        const context = {
          ...createInvokationContext(currentCtx),
          $qrl$: QRL
        };
        return emitUsedSymbol(symbol, context.$element$), invoke(context, fn2, ...args);
      }
      throw qError(10);
    });
  };
  const createInvokationContext = (invoke2) => null == invoke2 ? newInvokeContext() : isArray(invoke2) ? newInvokeContextFromTuple(invoke2) : invoke2;
  const invokeQRL = async function(...args) {
    const fn = invokeFn();
    return await fn(...args);
  };
  const resolvedSymbol = refSymbol != null ? refSymbol : symbol;
  const hash = getSymbolHash$1(resolvedSymbol);
  const QRL = invokeQRL;
  const methods = {
    getSymbol: () => resolvedSymbol,
    getHash: () => hash,
    resolve,
    $resolveLazy$: resolveLazy,
    $setContainer$: setContainer,
    $chunk$: chunk,
    $symbol$: symbol,
    $refSymbol$: refSymbol,
    $hash$: hash,
    getFn: invokeFn,
    $capture$: capture,
    $captureRef$: captureRef
  };
  return Object.assign(invokeQRL, methods);
};
const getSymbolHash$1 = (symbolName) => {
  const index2 = symbolName.lastIndexOf("_");
  return index2 > -1 ? symbolName.slice(index2 + 1) : symbolName;
};
const emitUsedSymbol = (symbol, element) => {
  isServer$1() || "object" != typeof document || document.dispatchEvent(new CustomEvent("qsymbol", {
    bubbles: false,
    detail: {
      symbol,
      element,
      timestamp: performance.now()
    }
  }));
};
let runtimeSymbolId = 0;
const inlinedQrl = (symbol, symbolName, lexicalScopeCapture = EMPTY_ARRAY$1) => createQRL("/inlinedQRL", symbolName, symbol, null, null, lexicalScopeCapture, null);
const stringifyQRL = (qrl, opts = {}) => {
  var _a2;
  let symbol = qrl.$symbol$;
  let chunk = qrl.$chunk$;
  const refSymbol = (_a2 = qrl.$refSymbol$) != null ? _a2 : symbol;
  const platform = getPlatform();
  if (platform) {
    const result = platform.chunkForSymbol(refSymbol);
    result && (chunk = result[1], qrl.$refSymbol$ || (symbol = result[0]));
  }
  chunk.startsWith("./") && (chunk = chunk.slice(2));
  const parts = [chunk];
  symbol && "default" !== symbol && parts.push("#", symbol);
  const capture = qrl.$capture$;
  const captureRef = qrl.$captureRef$;
  if (captureRef && captureRef.length) {
    if (opts.$getObjId$) {
      const capture2 = captureRef.map(opts.$getObjId$);
      parts.push(`[${capture2.join(" ")}]`);
    } else if (opts.$addRefMap$) {
      const capture2 = captureRef.map(opts.$addRefMap$);
      parts.push(`[${capture2.join(" ")}]`);
    }
  } else {
    capture && capture.length > 0 && parts.push(`[${capture.join(" ")}]`);
  }
  return parts.join("");
};
const serializeQRLs = (existingQRLs, elCtx) => {
  var value;
  (function(value2) {
    return value2 && "number" == typeof value2.nodeType;
  })(value = elCtx.$element$) && value.nodeType;
  const opts = {
    $element$: elCtx.$element$,
    $addRefMap$: (obj) => addToArray(elCtx.$refMap$, obj)
  };
  return existingQRLs.map((qrl) => stringifyQRL(qrl, opts)).join("\n");
};
const parseQRL = (qrl, containerEl) => {
  const endIdx = qrl.length;
  const hashIdx = indexOf(qrl, 0, "#");
  const captureIdx = indexOf(qrl, hashIdx, "[");
  const chunkEndIdx = Math.min(hashIdx, captureIdx);
  const chunk = qrl.substring(0, chunkEndIdx);
  const symbolStartIdx = hashIdx == endIdx ? hashIdx : hashIdx + 1;
  const symbolEndIdx = captureIdx;
  const symbol = symbolStartIdx == symbolEndIdx ? "default" : qrl.substring(symbolStartIdx, symbolEndIdx);
  const captureStartIdx = captureIdx;
  const captureEndIdx = endIdx;
  const capture = captureStartIdx === captureEndIdx ? EMPTY_ARRAY$1 : qrl.substring(captureStartIdx + 1, captureEndIdx - 1).split(" ");
  "/runtimeQRL" === chunk && logError(codeToText(2), qrl);
  const iQrl = createQRL(chunk, symbol, null, null, capture, null, null);
  return containerEl && iQrl.$setContainer$(containerEl), iQrl;
};
const indexOf = (text, startIdx, char) => {
  const endIdx = text.length;
  const charIdx = text.indexOf(char, startIdx == endIdx ? 0 : startIdx);
  return -1 == charIdx ? endIdx : charIdx;
};
const addToArray = (array, obj) => {
  const index2 = array.indexOf(obj);
  return -1 === index2 ? (array.push(obj), array.length - 1) : index2;
};
const $ = (expression) => ((symbol, lexicalScopeCapture = EMPTY_ARRAY$1) => createQRL("/runtimeQRL", "s" + runtimeSymbolId++, symbol, null, null, lexicalScopeCapture, null))(expression);
const componentQrl = (onRenderQrl) => {
  function QwikComponent(props, key) {
    const hash = onRenderQrl.$hash$;
    return jsx(Virtual, {
      "q:renderFn": onRenderQrl,
      ...props
    }, hash + ":" + (key || ""));
  }
  return QwikComponent[SERIALIZABLE_STATE] = [onRenderQrl], QwikComponent;
};
const isQwikComponent = (component) => "function" == typeof component && void 0 !== component[SERIALIZABLE_STATE];
const Slot = (props) => {
  var _a2;
  const name = (_a2 = props.name) != null ? _a2 : "";
  return jsx(Virtual, {
    "q:s": ""
  }, name);
};
const renderSSR = async (node, opts) => {
  var _a2;
  const root = opts.containerTagName;
  const containerEl = createContext(1).$element$;
  const containerState = createContainerState(containerEl);
  const rctx = createRenderContext({
    nodeType: 9
  }, containerState);
  const headNodes = (_a2 = opts.beforeContent) != null ? _a2 : [];
  const ssrCtx = {
    rctx,
    $contexts$: [],
    projectedChildren: void 0,
    projectedContext: void 0,
    hostCtx: void 0,
    invocationContext: void 0,
    headNodes: "html" === root ? headNodes : []
  };
  const containerAttributes = {
    ...opts.containerAttributes,
    "q:container": "paused",
    "q:version": "0.9.0",
    "q:render": "ssr",
    "q:base": opts.base,
    children: "html" === root ? [node] : [headNodes, node]
  };
  containerState.$envData$ = {
    url: opts.url,
    ...opts.envData
  }, node = jsx(root, containerAttributes), containerState.$hostsRendering$ = /* @__PURE__ */ new Set(), containerState.$renderPromise$ = Promise.resolve().then(() => renderRoot(node, ssrCtx, opts.stream, containerState, opts)), await containerState.$renderPromise$;
};
const renderRoot = async (node, ssrCtx, stream, containerState, opts) => {
  const beforeClose = opts.beforeClose;
  return await renderNode(node, ssrCtx, stream, 0, beforeClose ? (stream2) => {
    const result = beforeClose(ssrCtx.$contexts$, containerState);
    return processData(result, ssrCtx, stream2, 0, void 0);
  } : void 0), ssrCtx.rctx.$static$;
};
const renderNodeVirtual = (node, elCtx, extraNodes, ssrCtx, stream, flags, beforeClose) => {
  var _a2;
  const props = node.props;
  const renderQrl = props["q:renderFn"];
  if (renderQrl) {
    return elCtx.$renderQrl$ = renderQrl, renderSSRComponent(ssrCtx, stream, elCtx, node, flags, beforeClose);
  }
  let virtualComment = "<!--qv" + renderVirtualAttributes(props);
  const isSlot = "q:s" in props;
  const key = null != node.key ? String(node.key) : null;
  if (isSlot && ((_a2 = ssrCtx.hostCtx) == null ? void 0 : _a2.$id$, virtualComment += " q:sref=" + ssrCtx.hostCtx.$id$), null != key && (virtualComment += " q:key=" + key), virtualComment += "-->", stream.write(virtualComment), extraNodes) {
    for (const node2 of extraNodes) {
      renderNodeElementSync(node2.type, node2.props, stream);
    }
  }
  const promise = walkChildren(props.children, ssrCtx, stream, flags);
  return then(promise, () => {
    var _a3;
    if (!isSlot && !beforeClose) {
      return void stream.write(CLOSE_VIRTUAL);
    }
    let promise2;
    if (isSlot) {
      const content = (_a3 = ssrCtx.projectedChildren) == null ? void 0 : _a3[key];
      content && (ssrCtx.projectedChildren[key] = void 0, promise2 = processData(content, ssrCtx.projectedContext, stream, flags));
    }
    return beforeClose && (promise2 = then(promise2, () => beforeClose(stream))), then(promise2, () => {
      stream.write(CLOSE_VIRTUAL);
    });
  });
};
const CLOSE_VIRTUAL = "<!--/qv-->";
const renderVirtualAttributes = (attributes) => {
  let text = "";
  for (const prop of Object.keys(attributes)) {
    if ("children" === prop) {
      continue;
    }
    const value = attributes[prop];
    null != value && (text += " " + ("" === value ? prop : prop + "=" + value));
  }
  return text;
};
const renderNodeElementSync = (tagName, attributes, stream) => {
  if (stream.write("<" + tagName + ((attributes2) => {
    let text = "";
    for (const prop of Object.keys(attributes2)) {
      if ("dangerouslySetInnerHTML" === prop) {
        continue;
      }
      const value = attributes2[prop];
      null != value && (text += " " + ("" === value ? prop : prop + '="' + value + '"'));
    }
    return text;
  })(attributes) + ">"), !!emptyElements[tagName]) {
    return;
  }
  const innerHTML = attributes.dangerouslySetInnerHTML;
  null != innerHTML && stream.write(innerHTML), stream.write(`</${tagName}>`);
};
const renderSSRComponent = (ssrCtx, stream, elCtx, node, flags, beforeClose) => (setComponentProps(ssrCtx.rctx, elCtx, node.props), then(executeComponent(ssrCtx.rctx, elCtx), (res) => {
  const hostElement = elCtx.$element$;
  const newCtx = res.rctx;
  const invocationContext = newInvokeContext(hostElement, void 0);
  invocationContext.$subscriber$ = hostElement, invocationContext.$renderCtx$ = newCtx;
  const projectedContext = {
    ...ssrCtx,
    rctx: newCtx
  };
  const newSSrContext = {
    ...ssrCtx,
    projectedChildren: splitProjectedChildren(node.props.children, ssrCtx),
    projectedContext,
    rctx: newCtx,
    invocationContext
  };
  const extraNodes = [];
  if (elCtx.$appendStyles$) {
    const array = 4 & flags ? ssrCtx.headNodes : extraNodes;
    for (const style of elCtx.$appendStyles$) {
      array.push(jsx("style", {
        "q:style": style.styleId,
        dangerouslySetInnerHTML: style.content
      }));
    }
  }
  const newID = getNextIndex(ssrCtx.rctx);
  const scopeId = elCtx.$scopeIds$ ? serializeSStyle(elCtx.$scopeIds$) : void 0;
  const processedNode = jsx(node.type, {
    "q:sstyle": scopeId,
    "q:id": newID,
    children: res.node
  }, node.key);
  return elCtx.$id$ = newID, ssrCtx.$contexts$.push(elCtx), newSSrContext.hostCtx = elCtx, renderNodeVirtual(processedNode, elCtx, extraNodes, newSSrContext, stream, flags, (stream2) => beforeClose ? then(renderQTemplates(newSSrContext, stream2), () => beforeClose(stream2)) : renderQTemplates(newSSrContext, stream2));
}));
const renderQTemplates = (ssrContext, stream) => {
  const projectedChildren = ssrContext.projectedChildren;
  if (projectedChildren) {
    const nodes = Object.keys(projectedChildren).map((slotName) => {
      const value = projectedChildren[slotName];
      if (value) {
        return jsx("q:template", {
          [QSlot]: slotName,
          hidden: "",
          "aria-hidden": "true",
          children: value
        });
      }
    });
    return processData(nodes, ssrContext, stream, 0, void 0);
  }
};
const splitProjectedChildren = (children, ssrCtx) => {
  var _a2;
  const flatChildren = flatVirtualChildren(children, ssrCtx);
  if (null === flatChildren) {
    return;
  }
  const slotMap = {};
  for (const child of flatChildren) {
    let slotName = "";
    isJSXNode(child) && (slotName = (_a2 = child.props[QSlot]) != null ? _a2 : "");
    let array = slotMap[slotName];
    array || (slotMap[slotName] = array = []), array.push(child);
  }
  return slotMap;
};
const createContext = (nodeType) => getContext({
  nodeType,
  _qc_: null
});
const renderNode = (node, ssrCtx, stream, flags, beforeClose) => {
  var _a2;
  const tagName = node.type;
  if ("string" == typeof tagName) {
    const key = node.key;
    const props = node.props;
    const elCtx = createContext(1);
    const isHead = "head" === tagName;
    const hostCtx = ssrCtx.hostCtx;
    let openingElement = "<" + tagName + ((elCtx2, attributes) => {
      let text = "";
      for (const prop of Object.keys(attributes)) {
        if ("children" === prop || "key" === prop || "class" === prop || "className" === prop || "dangerouslySetInnerHTML" === prop) {
          continue;
        }
        const value = attributes[prop];
        if ("ref" === prop) {
          value.current = elCtx2.$element$;
          continue;
        }
        if (isOnProp(prop)) {
          setEvent(elCtx2.li, prop, value);
          continue;
        }
        const attrName = processPropKey(prop);
        const attrValue = processPropValue(attrName, value);
        null != attrValue && (text += " " + ("" === value ? attrName : attrName + '="' + escapeAttr(attrValue) + '"'));
      }
      return text;
    })(elCtx, props);
    let classStr = stringifyClass((_a2 = props.class) != null ? _a2 : props.className);
    if (hostCtx && (hostCtx.$scopeIds$ && (classStr = hostCtx.$scopeIds$.join(" ") + " " + classStr), !hostCtx.$attachedListeners$)) {
      hostCtx.$attachedListeners$ = true;
      for (const eventName of Object.keys(hostCtx.li)) {
        addQRLListener(elCtx.li, eventName, hostCtx.li[eventName]);
      }
    }
    isHead && (flags |= 1), classStr = classStr.trim(), classStr && (openingElement += ' class="' + classStr + '"');
    const listeners = Object.keys(elCtx.li);
    for (const key2 of listeners) {
      openingElement += " " + key2 + '="' + serializeQRLs(elCtx.li[key2], elCtx) + '"';
    }
    if (null != key && (openingElement += ' q:key="' + key + '"'), "ref" in props || listeners.length > 0) {
      const newID = getNextIndex(ssrCtx.rctx);
      openingElement += ' q:id="' + newID + '"', elCtx.$id$ = newID, ssrCtx.$contexts$.push(elCtx);
    }
    if (1 & flags && (openingElement += " q:head"), openingElement += ">", stream.write(openingElement), emptyElements[tagName]) {
      return;
    }
    const innerHTML = props.dangerouslySetInnerHTML;
    if (null != innerHTML) {
      return stream.write(String(innerHTML)), void stream.write(`</${tagName}>`);
    }
    isHead || (flags &= -2), "html" === tagName ? flags |= 4 : flags &= -5;
    const promise = processData(props.children, ssrCtx, stream, flags);
    return then(promise, () => {
      if (isHead) {
        for (const node2 of ssrCtx.headNodes) {
          renderNodeElementSync(node2.type, node2.props, stream);
        }
        ssrCtx.headNodes.length = 0;
      }
      if (beforeClose) {
        return then(beforeClose(stream), () => {
          stream.write(`</${tagName}>`);
        });
      }
      stream.write(`</${tagName}>`);
    });
  }
  if (tagName === Virtual) {
    const elCtx = createContext(111);
    return renderNodeVirtual(node, elCtx, void 0, ssrCtx, stream, flags, beforeClose);
  }
  if (tagName === SSRComment) {
    return void stream.write("<!--" + node.props.data + "-->");
  }
  if (tagName === InternalSSRStream) {
    return (async (node2, ssrCtx2, stream2, flags2) => {
      stream2.write("<!--qkssr-f-->");
      const generator = node2.props.children;
      let value;
      if (isFunction(generator)) {
        const v = generator({
          write(chunk) {
            stream2.write(chunk), stream2.write("<!--qkssr-f-->");
          }
        });
        if (isPromise(v)) {
          return v;
        }
        value = v;
      } else {
        value = generator;
      }
      for await (const chunk of value) {
        await processData(chunk, ssrCtx2, stream2, flags2, void 0), stream2.write("<!--qkssr-f-->");
      }
    })(node, ssrCtx, stream, flags);
  }
  const res = invoke(ssrCtx.invocationContext, tagName, node.props, node.key);
  return processData(res, ssrCtx, stream, flags, beforeClose);
};
const processData = (node, ssrCtx, stream, flags, beforeClose) => {
  if (null != node && "boolean" != typeof node) {
    if (isString(node) || "number" == typeof node) {
      stream.write(escapeHtml(String(node)));
    } else {
      if (isJSXNode(node)) {
        return renderNode(node, ssrCtx, stream, flags, beforeClose);
      }
      if (isArray(node)) {
        return walkChildren(node, ssrCtx, stream, flags);
      }
      if (isPromise(node)) {
        return stream.write("<!--qkssr-f-->"), node.then((node2) => processData(node2, ssrCtx, stream, flags, beforeClose));
      }
    }
  }
};
function walkChildren(children, ssrContext, stream, flags) {
  if (null == children) {
    return;
  }
  if (!isArray(children)) {
    return processData(children, ssrContext, stream, flags);
  }
  if (1 === children.length) {
    return processData(children[0], ssrContext, stream, flags);
  }
  if (0 === children.length) {
    return;
  }
  let currentIndex = 0;
  const buffers = [];
  return children.reduce((prevPromise, child, index2) => {
    const buffer = [];
    buffers.push(buffer);
    const rendered = processData(child, ssrContext, prevPromise ? {
      write(chunk) {
        currentIndex === index2 ? stream.write(chunk) : buffer.push(chunk);
      }
    } : stream, flags);
    return isPromise(rendered) || prevPromise ? then(rendered, () => then(prevPromise, () => {
      currentIndex++, buffers.length > currentIndex && buffers[currentIndex].forEach((chunk) => stream.write(chunk));
    })) : void currentIndex++;
  }, void 0);
}
const flatVirtualChildren = (children, ssrCtx) => {
  if (null == children) {
    return null;
  }
  const result = _flatVirtualChildren(children, ssrCtx);
  const nodes = isArray(result) ? result : [result];
  return 0 === nodes.length ? null : nodes;
};
const stringifyClass = (str) => {
  if (!str) {
    return "";
  }
  if ("string" == typeof str) {
    return str;
  }
  if (Array.isArray(str)) {
    return str.join(" ");
  }
  const output = [];
  for (const key in str) {
    Object.prototype.hasOwnProperty.call(str, key) && str[key] && output.push(key);
  }
  return output.join(" ");
};
const _flatVirtualChildren = (children, ssrCtx) => {
  if (null == children) {
    return null;
  }
  if (isArray(children)) {
    return children.flatMap((c) => _flatVirtualChildren(c, ssrCtx));
  }
  if (isJSXNode(children) && isFunction(children.type) && children.type !== SSRComment && children.type !== InternalSSRStream && children.type !== Virtual) {
    const res = invoke(ssrCtx.invocationContext, children.type, children.props, children.key);
    return flatVirtualChildren(res, ssrCtx);
  }
  return children;
};
const setComponentProps = (rctx, ctx, expectProps) => {
  const keys = Object.keys(expectProps);
  if (0 === keys.length) {
    return;
  }
  const target = {};
  ctx.$props$ = createProps(target, rctx.$static$.$containerState$);
  for (const key of keys) {
    "children" !== key && "q:renderFn" !== key && (target[key] = expectProps[key]);
  }
};
function processPropKey(prop) {
  return "htmlFor" === prop ? "for" : prop;
}
function processPropValue(prop, value) {
  return "style" === prop ? stringifyStyle(value) : false === value || null == value ? null : true === value ? "" : String(value);
}
const emptyElements = {
  area: true,
  base: true,
  basefont: true,
  bgsound: true,
  br: true,
  col: true,
  embed: true,
  frame: true,
  hr: true,
  img: true,
  input: true,
  keygen: true,
  link: true,
  meta: true,
  param: true,
  source: true,
  track: true,
  wbr: true
};
const ESCAPE_HTML = /[&<>]/g;
const ESCAPE_ATTRIBUTES = /[&"]/g;
const escapeHtml = (s) => s.replace(ESCAPE_HTML, (c) => {
  switch (c) {
    case "&":
      return "&amp;";
    case "<":
      return "&lt;";
    case ">":
      return "&gt;";
    default:
      return "";
  }
});
const escapeAttr = (s) => s.replace(ESCAPE_ATTRIBUTES, (c) => {
  switch (c) {
    case "&":
      return "&amp;";
    case '"':
      return "&quot;";
    default:
      return "";
  }
});
const useStore = (initialState, opts) => {
  var _a2;
  const { get, set, ctx } = useSequentialScope();
  if (null != get) {
    return get;
  }
  const value = isFunction(initialState) ? initialState() : initialState;
  if (false === (opts == null ? void 0 : opts.reactive)) {
    return set(value), value;
  }
  {
    const containerState = ctx.$renderCtx$.$static$.$containerState$;
    const newStore = createProxy(value, containerState, ((_a2 = opts == null ? void 0 : opts.recursive) != null ? _a2 : false) ? 1 : 0, void 0);
    return set(newStore), newStore;
  }
};
function useEnvData(key, defaultValue) {
  var _a2;
  return (_a2 = useInvokeContext().$renderCtx$.$static$.$containerState$.$envData$[key]) != null ? _a2 : defaultValue;
}
const STYLE_CACHE = /* @__PURE__ */ new Map();
const getScopedStyles = (css, scopeId) => {
  let styleCss = STYLE_CACHE.get(scopeId);
  return styleCss || STYLE_CACHE.set(scopeId, styleCss = scopeStylesheet(css, scopeId)), styleCss;
};
const scopeStylesheet = (css, scopeId) => {
  const end = css.length;
  const out = [];
  const stack = [];
  let idx = 0;
  let lastIdx = idx;
  let mode = rule;
  let lastCh = 0;
  for (; idx < end; ) {
    let ch = css.charCodeAt(idx++);
    ch === BACKSLASH && (idx++, ch = A);
    const arcs = STATE_MACHINE[mode];
    for (let i = 0; i < arcs.length; i++) {
      const arc = arcs[i];
      const [expectLastCh, expectCh, newMode] = arc;
      if ((expectLastCh === lastCh || expectLastCh === ANY || expectLastCh === IDENT && isIdent(lastCh) || expectLastCh === WHITESPACE && isWhiteSpace(lastCh)) && (expectCh === ch || expectCh === ANY || expectCh === IDENT && isIdent(ch) || expectCh === NOT_IDENT && !isIdent(ch) && ch !== DOT || expectCh === WHITESPACE && isWhiteSpace(ch)) && (3 == arc.length || lookAhead(arc))) {
        if (arc.length > 3 && (ch = css.charCodeAt(idx - 1)), newMode === EXIT || newMode == EXIT_INSERT_SCOPE) {
          newMode === EXIT_INSERT_SCOPE && (mode !== starSelector || shouldNotInsertScoping() ? isChainedSelector(ch) || insertScopingSelector(idx - (expectCh == NOT_IDENT ? 1 : expectCh == CLOSE_PARENTHESIS ? 2 : 0)) : (isChainedSelector(ch) ? flush(idx - 2) : insertScopingSelector(idx - 2), lastIdx++)), expectCh === NOT_IDENT && (idx--, ch = lastCh);
          do {
            mode = stack.pop() || rule, mode === pseudoGlobal && (flush(idx - 1), lastIdx++);
          } while (isSelfClosingRule(mode));
        } else {
          stack.push(mode), mode === pseudoGlobal && newMode === rule ? (flush(idx - 8), lastIdx = idx) : newMode === pseudoElement && insertScopingSelector(idx - 2), mode = newMode;
        }
        break;
      }
    }
    lastCh = ch;
  }
  return flush(idx), out.join("");
  function flush(idx2) {
    out.push(css.substring(lastIdx, idx2)), lastIdx = idx2;
  }
  function insertScopingSelector(idx2) {
    mode === pseudoGlobal || shouldNotInsertScoping() || (flush(idx2), out.push(".", "\u2B50\uFE0F", scopeId));
  }
  function lookAhead(arc) {
    let prefix = 0;
    if (css.charCodeAt(idx) === DASH) {
      for (let i = 1; i < 10; i++) {
        if (css.charCodeAt(idx + i) === DASH) {
          prefix = i + 1;
          break;
        }
      }
    }
    words:
      for (let arcIndx = 3; arcIndx < arc.length; arcIndx++) {
        const txt = arc[arcIndx];
        for (let i = 0; i < txt.length; i++) {
          if ((css.charCodeAt(idx + i + prefix) | LOWERCASE) !== txt.charCodeAt(i)) {
            continue words;
          }
        }
        return idx += txt.length + prefix, true;
      }
    return false;
  }
  function shouldNotInsertScoping() {
    return -1 !== stack.indexOf(pseudoGlobal) || -1 !== stack.indexOf(atRuleSelector);
  }
};
const isIdent = (ch) => ch >= _0 && ch <= _9 || ch >= A && ch <= Z || ch >= a && ch <= z || ch >= 128 || ch === UNDERSCORE || ch === DASH;
const isChainedSelector = (ch) => ch === COLON || ch === DOT || ch === OPEN_BRACKET || ch === HASH || isIdent(ch);
const isSelfClosingRule = (mode) => mode === atRuleBlock || mode === atRuleSelector || mode === atRuleInert || mode === pseudoGlobal;
const isWhiteSpace = (ch) => ch === SPACE || ch === TAB || ch === NEWLINE || ch === CARRIAGE_RETURN;
const rule = 0;
const starSelector = 2;
const pseudoGlobal = 5;
const pseudoElement = 6;
const atRuleSelector = 10;
const atRuleBlock = 11;
const atRuleInert = 12;
const EXIT = 17;
const EXIT_INSERT_SCOPE = 18;
const ANY = 0;
const IDENT = 1;
const NOT_IDENT = 2;
const WHITESPACE = 3;
const TAB = 9;
const NEWLINE = 10;
const CARRIAGE_RETURN = 13;
const SPACE = 32;
const HASH = 35;
const CLOSE_PARENTHESIS = 41;
const DASH = 45;
const DOT = 46;
const _0 = 48;
const _9 = 57;
const COLON = 58;
const A = 65;
const Z = 90;
const OPEN_BRACKET = 91;
const BACKSLASH = 92;
const UNDERSCORE = 95;
const LOWERCASE = 32;
const a = 97;
const z = 122;
const STRINGS_COMMENTS = [[ANY, 39, 14], [ANY, 34, 15], [ANY, 47, 16, "*"]];
const STATE_MACHINE = [[[ANY, 42, starSelector], [ANY, OPEN_BRACKET, 7], [ANY, COLON, pseudoElement, ":"], [ANY, COLON, pseudoGlobal, "global"], [ANY, COLON, 3, "has", "host-context", "not", "where", "is", "matches", "any"], [ANY, COLON, 4], [ANY, IDENT, 1], [ANY, DOT, 1], [ANY, HASH, 1], [ANY, 64, atRuleSelector, "keyframe"], [ANY, 64, atRuleBlock, "media", "supports"], [ANY, 64, atRuleInert], [ANY, 123, 13], [47, 42, 16], [ANY, 59, EXIT], [ANY, 125, EXIT], [ANY, CLOSE_PARENTHESIS, EXIT], ...STRINGS_COMMENTS], [[ANY, NOT_IDENT, EXIT_INSERT_SCOPE]], [[ANY, NOT_IDENT, EXIT_INSERT_SCOPE]], [[ANY, 40, rule], [ANY, NOT_IDENT, EXIT_INSERT_SCOPE]], [[ANY, 40, 8], [ANY, NOT_IDENT, EXIT_INSERT_SCOPE]], [[ANY, 40, rule], [ANY, NOT_IDENT, EXIT]], [[ANY, NOT_IDENT, EXIT]], [[ANY, 93, EXIT_INSERT_SCOPE], [ANY, 39, 14], [ANY, 34, 15]], [[ANY, CLOSE_PARENTHESIS, EXIT], ...STRINGS_COMMENTS], [[ANY, 125, EXIT], ...STRINGS_COMMENTS], [[ANY, 125, EXIT], [WHITESPACE, IDENT, 1], [ANY, COLON, pseudoGlobal, "global"], [ANY, 123, 13], ...STRINGS_COMMENTS], [[ANY, 123, rule], [ANY, 59, EXIT], ...STRINGS_COMMENTS], [[ANY, 59, EXIT], [ANY, 123, 9], ...STRINGS_COMMENTS], [[ANY, 125, EXIT], [ANY, 123, 13], [ANY, 40, 8], ...STRINGS_COMMENTS], [[ANY, 39, EXIT]], [[ANY, 34, EXIT]], [[42, 47, EXIT]]];
const useStylesQrl = (styles2) => {
  _useStyles(styles2, (str) => str, false);
};
const useStylesScopedQrl = (styles2) => {
  _useStyles(styles2, getScopedStyles, true);
};
const _useStyles = (styleQrl, transform, scoped) => {
  const { get, set, ctx, i } = useSequentialScope();
  if (get) {
    return get;
  }
  const renderCtx = ctx.$renderCtx$;
  const styleId = (index2 = i, `${((text, hash = 0) => {
    if (0 === text.length) {
      return hash;
    }
    for (let i2 = 0; i2 < text.length; i2++) {
      hash = (hash << 5) - hash + text.charCodeAt(i2), hash |= 0;
    }
    return Number(Math.abs(hash)).toString(36);
  })(styleQrl.$hash$)}-${index2}`);
  var index2;
  const containerState = renderCtx.$static$.$containerState$;
  const elCtx = getContext(ctx.$hostElement$);
  if (set(styleId), elCtx.$appendStyles$ || (elCtx.$appendStyles$ = []), elCtx.$scopeIds$ || (elCtx.$scopeIds$ = []), scoped && elCtx.$scopeIds$.push(((styleId2) => "\u2B50\uFE0F" + styleId2)(styleId)), ((containerState2, styleId2) => containerState2.$styleIds$.has(styleId2))(containerState, styleId)) {
    return styleId;
  }
  containerState.$styleIds$.add(styleId);
  const value = styleQrl.$resolveLazy$(containerState.$containerEl$);
  const appendStyle = (styleText) => {
    elCtx.$appendStyles$, elCtx.$appendStyles$.push({
      styleId,
      content: transform(styleText, styleId)
    });
  };
  return isPromise(value) ? ctx.$waitOn$.push(value.then(appendStyle)) : appendStyle(value), styleId;
};
const isServer = true;
const isBrowser = false;
const config = {
  defaultLocale: {
    lang: "fr-FR",
    currency: "EUR",
    timeZone: "Europe/Brussels"
  },
  supportedLocales: [
    {
      lang: "fr-FR",
      currency: "EUR",
      timeZone: "Europe/Brussels"
    },
    {
      lang: "it-IT",
      currency: "EUR",
      timeZone: "Europe/Rome"
    },
    {
      lang: "en-EN",
      currency: "USD",
      timeZone: "America/Los_Angeles"
    },
    {
      lang: "sp-SP",
      currency: "EUR",
      timeZone: "Europe/Madrid"
    },
    {
      lang: "nl-NL",
      currency: "EUR",
      timeZone: "Europe/Brussels"
    }
  ],
  assets: [
    "app"
  ]
};
const loadTranslation$ = inlinedQrl(async (lang, asset, origin) => {
  let url = "";
  if (isServer && origin)
    url = origin;
  url += `/i18n/${lang}/${asset}.json`;
  const data = await fetch(url);
  return data.json();
}, "s_XwAYrqzfHSc");
const translationFn = {
  loadTranslation$
};
const onRequest = ({ request, response, params }) => {
  var _a2, _b, _c, _d;
  let lang = (_a2 = params.lang) == null ? void 0 : _a2.replace(/^\/|\/$/g, "");
  response.locale = lang || config.defaultLocale.lang;
  if (!lang) {
    const cookie = (_b = request.headers) == null ? void 0 : _b.get("cookie");
    const acceptLanguage = (_c = request.headers) == null ? void 0 : _c.get("accept-language");
    if (cookie) {
      const result = new RegExp("(?:^|; )" + encodeURIComponent("locale") + "=([^;]*)").exec(cookie);
      if (result)
        lang = JSON.parse(result[1])["lang"];
    }
    if (!lang) {
      if (acceptLanguage)
        lang = (_d = acceptLanguage.split(";")[0]) == null ? void 0 : _d.split(",")[0];
    }
    if (lang !== config.defaultLocale.lang) {
      if (config.supportedLocales.find((x) => x.lang === lang)) {
        const url = new URL(request.url);
        throw response.redirect(`/${lang}${url.pathname}`, 302);
      }
    }
  }
};
const layout = /* @__PURE__ */ componentQrl(inlinedQrl(() => {
  return /* @__PURE__ */ jsx(Fragment, {
    children: /* @__PURE__ */ jsx(Slot, {})
  });
}, "s_KH4R1BTHGdA"));
const Q1Layout_ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  onRequest,
  default: layout
}, Symbol.toStringTag, { value: "Module" }));
/**
 * @license
 * Qwik Speak
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/robisim74/qwik-speak/blob/main/LICENSE
 */
const SpeakContext = createContext$1("qwikspeak");
const cache = {};
const memoize = (fn) => {
  return (...args) => {
    const stringArgs = JSON.stringify(args);
    return stringArgs in cache ? cache[stringArgs] : cache[stringArgs] = fn(...args).catch((x) => {
      delete cache[stringArgs];
      return x;
    });
  };
};
const loadTranslation = async (lang, ctx, origin, assets) => {
  const { config: config2, translationFn: translationFn2 } = ctx;
  assets = assets != null ? assets : config2.assets;
  const memoized = memoize(translationFn2.loadTranslation$);
  const tasks = assets.map((asset) => memoized(lang, asset, origin));
  const sources = await Promise.all(tasks);
  const translation = {};
  for (const data of sources)
    if (data)
      addData(translation, data, lang);
  return translation;
};
const addData = (translation, data, lang) => {
  translation[lang] = translation[lang] !== void 0 ? {
    ...translation[lang],
    ...data
  } : data;
};
const QwikSpeak = /* @__PURE__ */ componentQrl(inlinedQrl((props) => {
  var _a2, _b, _c;
  const resolvedTranslationFn = {
    loadTranslation$: (_b = (_a2 = props.translationFn) == null ? void 0 : _a2.loadTranslation$) != null ? _b : inlinedQrl(() => null, "QwikSpeak_component_resolvedTranslationFn_40VQUrrUu08")
  };
  const state = useStore({
    locale: {},
    translation: Object.fromEntries(props.config.supportedLocales.map((value) => [
      value.lang,
      {}
    ])),
    config: {
      defaultLocale: props.config.defaultLocale,
      supportedLocales: props.config.supportedLocales,
      assets: [
        ...props.config.assets
      ],
      keySeparator: props.config.keySeparator || ".",
      keyValueSeparator: props.config.keyValueSeparator || "@@"
    },
    translationFn: resolvedTranslationFn
  }, {
    recursive: true
  });
  const ctx = state;
  const { locale, translation, config: config2, translationFn: translationFn2 } = ctx;
  useContextProvider(SpeakContext, ctx);
  const url = new URL((_c = useEnvData("url")) != null ? _c : document.location.href);
  const lang = useEnvData("locale");
  useMountQrl(inlinedQrl(async () => {
    var _a3, _b2;
    const [config22, ctx2, lang2, locale2, props2, translation2, translationFn22, url2] = useLexicalScope();
    const resolvedLocale = (_b2 = (_a3 = props2.locale) != null ? _a3 : config22.supportedLocales.find((value) => value.lang === lang2)) != null ? _b2 : config22.defaultLocale;
    const resolvedLangs = new Set(props2.langs || []);
    resolvedLangs.add(resolvedLocale.lang);
    for (const lang1 of resolvedLangs) {
      const loadedTranslation = await loadTranslation(lang1, ctx2, url2.origin);
      Object.assign(translation2, loadedTranslation);
    }
    Object.assign(locale2, resolvedLocale);
    if (isServer) {
      Object.freeze(translation2);
      Object.freeze(config22);
      Object.freeze(translationFn22);
    }
  }, "QwikSpeak_component_useMount_KG1JVWT5AXk", [
    config2,
    ctx,
    lang,
    locale,
    props,
    translation,
    translationFn2,
    url
  ]));
  return /* @__PURE__ */ jsx(Slot, {}, "oX_0");
}, "QwikSpeak_component_RizPy0NEy9M"));
const useSpeakContext = () => useContext(SpeakContext);
const useSpeakLocale = () => useContext(SpeakContext).locale;
const Speak = /* @__PURE__ */ componentQrl(inlinedQrl((props) => {
  var _a2;
  const ctx = useSpeakContext();
  const { locale, translation, config: config2 } = ctx;
  const url = new URL((_a2 = useEnvData("url")) != null ? _a2 : document.location.href);
  useMountQrl(inlinedQrl(async () => {
    const [config22, ctx2, locale2, props2, translation2, url2] = useLexicalScope();
    const resolvedLangs = new Set(props2.langs || []);
    resolvedLangs.add(locale2.lang);
    for (const lang of resolvedLangs) {
      const loadedTranslation = await loadTranslation(lang, ctx2, url2.origin, props2.assets);
      addData(loadedTranslation, translation2[lang], lang);
      Object.assign(translation2[lang], loadedTranslation[lang]);
    }
    const resolvedAssets = /* @__PURE__ */ new Set([
      ...config22.assets,
      ...props2.assets
    ]);
    Object.assign(config22.assets, Array.from(resolvedAssets));
  }, "Speak_component_useMount_7lFwWb3B7fc", [
    config2,
    ctx,
    locale,
    props,
    translation,
    url
  ]));
  return /* @__PURE__ */ jsx(Slot, {}, "08_0");
}, "Speak_component_k0JdB1hwHVc"));
const changeLocale = async (newLocale, ctx) => {
  const { locale, translation } = ctx;
  const loadedTranslation = await loadTranslation(newLocale.lang, ctx);
  Object.assign(translation, loadedTranslation);
  Object.assign(locale, newLocale);
};
const $lang = (lang) => useSpeakLocale().lang === lang;
const styles$1 = ".home-info {\n  display: flex;\n  height: 50vh;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  font-size: 1.875rem;\n  line-height: 2.25rem;\n  transition-property: all;\n  transition-duration: 1000ms;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1)\n}\n.home-info-name {\n  padding-top: 3.5rem;\n  font-weight: 500;\n  --tw-text-opacity: 1;\n  color: rgb(78 161 211 / var(--tw-text-opacity))\n}\n.home-info-post {\n  font-size: 1.5rem;\n  line-height: 2rem;\n  font-weight: 200\n}\n.home-info-location {\n  margin-bottom: 0.25rem;\n  width: 15%;\n  border-bottom-width: 0.1rem;\n  border-bottom-color: #D8E9EF80;\n  padding-bottom: 0.5rem;\n  text-align: center;\n  font-size: 1rem;\n  line-height: 1.5rem;\n  font-weight: 400\n}\n@media (min-width: 0px) and (max-width: 767px) {\n  .home-info-location {\n    width: 80%\n  }\n}\n.home-info-logo {\n  width: 8rem\n}\n.home-info-social {\n  display: flex;\n  gap: 0.5rem\n}\n\n.anim-info-disappear {\n  margin-top: -20%;\n  opacity: 0\n}\n\n.neumorphism {\n  position: fixed;\n  top: 50%;\n  left: 50%;\n  margin-top: 0px;\n  max-height: 75%;\n  min-width: 25%;\n  max-width: 50%;\n  border-radius: 1.5rem;\n  --tw-bg-opacity: 1;\n  background-color: rgb(14 14 17 / var(--tw-bg-opacity));\n  background-color: transparent;\n  padding: 2.5rem;\n  opacity: 1;\n  transition-property: all;\n  transition-duration: 150ms;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transform: translate(-50%, -50%)\n}\n\n.exp {\n  display: flex;\n  border-bottom-width: 0.1rem;\n  border-bottom-color: #D8E9EF80;\n  padding: 0.75rem\n}\n\n@media (min-width: 0px) and (max-width: 767px) {\n  .exp {\n    display: block\n  }\n}\n.exp-container {\n  max-height: 60vh;\n  min-height: 10vh;\n  overflow-y: auto\n}\n.exp:last-child {\n  border-bottom-width: 0px\n}\n.exp-img {\n  aspect-ratio: 1 / 1;\n  width: 75rem;\n  -o-object-fit: contain;\n     object-fit: contain\n}\n@media (min-width: 0px) and (max-width: 767px) {\n  .exp-img {\n    margin: auto;\n    width: 50%\n  }\n}\n.exp-img-container {\n  margin-right: 1rem;\n  display: flex;\n  align-items: center\n}\n.exp-info {\n  display: flex;\n  min-width: 75%;\n  flex-direction: column;\n  justify-content: center;\n  padding-left: 0.5rem;\n  font-weight: 500;\n  --tw-text-opacity: 1;\n  color: rgb(78 161 211 / var(--tw-text-opacity))\n}\n.exp-info-description {\n  font-weight: 200;\n  --tw-text-opacity: 1;\n  color: rgb(216 233 239 / var(--tw-text-opacity))\n}\n.exp-info-technos {\n  display: flex;\n  flex-wrap: wrap\n}\n.exp-info-techno {\n  margin: 0.5rem;\n  border-radius: 0.25rem;\n  padding: 0.5rem;\n  font-size: 0.875rem;\n  line-height: 1.25rem;\n  --tw-text-opacity: 1;\n  color: rgb(216 233 239 / var(--tw-text-opacity));\n  box-shadow: 2.5px 2.5px 10px #000000, -2.5px -2.5px 10px #2d2d36\n}\n\n.skills-container {\n  max-height: 60vh;\n  min-height: 10vh;\n  overflow-y: auto\n}\n.skills-grid {\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: center\n}\n.skills-title {\n  text-align: center;\n  font-size: 1.125rem;\n  line-height: 1.75rem\n}\n.skills-skill {\n  margin: 0.5rem;\n  aspect-ratio: 1 / 1;\n  height: 4rem\n}\n.skills-skill img {\n  margin: auto;\n  height: 100%;\n  -o-object-fit: contain;\n     object-fit: contain\n}\n.skills-desc {\n  position: absolute;\n  left: 50%;\n  margin: auto;\n  width: 90%;\n  --tw-translate-x: -50%;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n  text-align: center\n}\n.skills-desc::before {\n  margin: 100%\n}\n.skills-description {\n  height: 8rem;\n  width: 100%;\n  overflow-y: auto\n}\n.skills-link {\n  font-weight: 500;\n  --tw-text-opacity: 1;\n  color: rgb(78 161 211 / var(--tw-text-opacity))\n}\n\n@media (max-width: 640px) {\n  /* ... */\n  .neumorphism {\n    left: 0px;\n    width: 100%;\n    max-width: 100%;\n    --tw-translate-x: 0px;\n    --tw-translate-y: -50%;\n    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))\n  }\n}";
const Logo = (props) => /* @__PURE__ */ jsx(Fragment, {
  children: /* @__PURE__ */ jsx("svg", {
    class: props.class,
    viewBox: "0 0 9.3351517 7.1780243",
    version: "1.1",
    id: "svg5",
    xmlns: "http://www.w3.org/2000/svg",
    children: [
      /* @__PURE__ */ jsx("defs", {
        id: "defs2",
        children: /* @__PURE__ */ jsx("rect", {
          x: "132.77115",
          y: "307.1171",
          width: "458.66397",
          height: "276.27127",
          id: "rect63"
        })
      }),
      /* @__PURE__ */ jsx("g", {
        id: "layer1",
        transform: "translate(-35.227486,-83.282224)",
        children: [
          /* @__PURE__ */ jsx("g", {
            "aria-label": "A",
            transform: "matrix(0.26458333,0,0,0.26458333,0.0156818,-0.36068148)",
            id: "text61",
            style: "font-size:40px;line-height:1.25;font-family:'Fast Hand';-inkscape-font-specification:'Fast Hand';white-space:pre;shape-inside:url(#rect63);fill:#0e0e11",
            children: /* @__PURE__ */ jsx("path", {
              d: "m 151.07227,334.35629 h -10.25391 l -1.79688,4.17969 c -0.44271,1.02865 -0.66406,1.79688 -0.66406,2.30469 0,0.40364 0.1888,0.76171 0.56641,1.07421 0.39063,0.29948 1.22396,0.49479 2.5,0.58594 v 0.72266 h -8.33985 v -0.72266 c 1.10677,-0.19531 1.82292,-0.44922 2.14844,-0.76172 0.66407,-0.625 1.39974,-1.89453 2.20703,-3.80859 l 9.31641,-21.79688 h 0.68359 l 9.21875,22.03125 c 0.74219,1.77083 0.88151,3.12631 1.48047,3.66017 0.61198,0.52083 -0.40105,0.61067 0.67968,0.67577 v 0.72266 l -4.0767,0.0234 c -0.95071,-2.23055 -1.26829,-3.01422 -2.06782,-5.08204 z m -0.54688,-1.44531 -4.49219,-10.70313 -4.60937,10.70313 z",
              style: "font-family:'Times New Roman';-inkscape-font-specification:'Times New Roman, ';fill:#d8e9ef;fill-opacity:1",
              id: "path5412"
            })
          }),
          /* @__PURE__ */ jsx("g", {
            "aria-label": "B",
            id: "text119",
            style: "font-size:10.5833px;line-height:1.25;font-family:'Fast Hand';-inkscape-font-specification:'Fast Hand';fill:#0e0e11;fill-opacity:1;stroke-width:0.264583",
            transform: "matrix(0.78083522,0,0,1.0023109,8.4700523,-0.19246288)",
            children: /* @__PURE__ */ jsx("path", {
              d: "m 44.631419,86.864241 c 0.485757,0.103353 0.849213,0.268717 1.090369,0.496092 0.334173,0.316948 0.50126,0.70452 0.50126,1.162716 0,0.347954 -0.110243,0.682127 -0.330729,1.00252 -0.220485,0.316948 -0.523653,0.549491 -0.909502,0.69763 -0.382404,0.144693 -0.969397,0.211672 -1.758317,0.213947 l -1.422176,0.0041 c 0.042,-0.145886 -0.655226,-1.029139 -0.812687,-1.245387 L 38.6889,84.657485 c -0.196632,-0.387874 0.34398,-0.715379 0.244072,-0.829066 -0.134358,-0.151584 0.281201,-0.337173 0.01618,-0.348696 l -0.09508,-0.0041 0.179701,-0.191202 h 3.930573 c 0.564994,0 1.018023,0.04134 1.359086,0.124023 0.516763,0.124023 0.911225,0.344509 1.183387,0.661456 0.272161,0.313503 0.390672,0.823787 0.390672,1.233752 0,0.351399 -0.106798,0.666624 -0.320393,0.945676 -0.213595,0.275607 -0.52882,0.480589 -0.945675,0.614947 z m -4.715108,-0.279052 c 0.127468,0.02411 0.272162,0.04306 0.434081,0.05684 0.165364,0.01033 2.353502,0.0155 2.549872,0.0155 0.502982,0 0.880219,-0.0534 1.13171,-0.160196 0.254936,-0.110243 0.449583,-0.277329 0.583942,-0.50126 0.134358,-0.223931 0.201537,-0.468532 0.201537,-0.733803 0,-0.409965 -0.149517,-0.908191 -0.48369,-1.197578 -0.334173,-0.289387 -0.821652,-0.434081 -1.462438,-0.434081 -0.344509,0 -3.546537,-0.06775 -3.822144,0.008 z m 2.007271,3.348623 c 0.39963,0.09302 0.794092,0.139525 1.183387,0.139525 0.62356,0 1.098982,-0.139526 1.426265,-0.418577 0.327283,-0.282497 0.490924,-0.630451 0.490924,-1.043861 0,-0.272161 -0.07407,-0.533988 -0.222208,-0.785479 -0.148139,-0.251491 -0.389295,-0.449584 -0.723468,-0.594277 -0.334173,-0.144694 -0.747583,-0.217041 -1.24023,-0.217041 -0.213595,0 -2.403456,0.0034 -2.555039,0.01034 -0.151584,0.0069 -0.273885,0.01894 -0.366902,0.03617 z",
              style: "font-family:'Times New Roman';-inkscape-font-specification:'Times New Roman, ';fill:#d8e9ef;fill-opacity:1",
              id: "path326"
            })
          }),
          /* @__PURE__ */ jsx("path", {
            id: "rect13453",
            style: "fill:#4ea1d3;stroke-width:0.264583",
            d: "m 38.406507,84.302044 0.438282,-1.019819 0.179353,6.39e-4 3.0065,7.171582 -1.072838,0.0058 z"
          })
        ]
      })
    ]
  })
});
const LogoAlt = (props) => /* @__PURE__ */ jsx(Fragment, {
  children: /* @__PURE__ */ jsx("svg", {
    class: props.class,
    viewBox: "0 0 9.3351517 7.1780243",
    version: "1.1",
    id: "svg5",
    xmlns: "http://www.w3.org/2000/svg",
    children: [
      /* @__PURE__ */ jsx("defs", {
        id: "defs2",
        children: /* @__PURE__ */ jsx("rect", {
          x: "132.77115",
          y: "307.1171",
          width: "458.66397",
          height: "276.27127",
          id: "rect63"
        })
      }),
      /* @__PURE__ */ jsx("g", {
        id: "layer1",
        transform: "translate(-35.227486,-83.282224)",
        children: [
          /* @__PURE__ */ jsx("g", {
            "aria-label": "A",
            transform: "matrix(0.26458333,0,0,0.26458333,0.0156818,-0.36068148)",
            id: "text61",
            style: "font-size:40px;line-height:1.25;font-family:'Fast Hand';-inkscape-font-specification:'Fast Hand';white-space:pre;shape-inside:url(#rect63);fill:#0e0e11",
            children: /* @__PURE__ */ jsx("path", {
              d: "m 151.07227,334.35629 h -10.25391 l -1.79688,4.17969 c -0.44271,1.02865 -0.66406,1.79688 -0.66406,2.30469 0,0.40364 0.1888,0.76171 0.56641,1.07421 0.39063,0.29948 1.22396,0.49479 2.5,0.58594 v 0.72266 h -8.33985 v -0.72266 c 1.10677,-0.19531 1.82292,-0.44922 2.14844,-0.76172 0.66407,-0.625 1.39974,-1.89453 2.20703,-3.80859 l 9.31641,-21.79688 h 0.68359 l 9.21875,22.03125 c 0.74219,1.77083 0.88151,3.12631 1.48047,3.66017 0.61198,0.52083 -0.40105,0.61067 0.67968,0.67577 v 0.72266 l -4.0767,0.0234 c -0.95071,-2.23055 -1.26829,-3.01422 -2.06782,-5.08204 z m -0.54688,-1.44531 -4.49219,-10.70313 -4.60937,10.70313 z",
              style: "font-family:'Times New Roman';-inkscape-font-specification:'Times New Roman, ';fill:#d8e9ef;fill-opacity:1",
              id: "path5412"
            })
          }),
          /* @__PURE__ */ jsx("g", {
            "aria-label": "B",
            id: "text119",
            style: "font-size:10.5833px;line-height:1.25;font-family:'Fast Hand';-inkscape-font-specification:'Fast Hand';fill:#0e0e11;fill-opacity:1;stroke-width:0.264583",
            transform: "matrix(0.78083522,0,0,1.0023109,8.4700523,-0.19246288)",
            children: /* @__PURE__ */ jsx("path", {
              d: "m 44.631419,86.864241 c 0.485757,0.103353 0.849213,0.268717 1.090369,0.496092 0.334173,0.316948 0.50126,0.70452 0.50126,1.162716 0,0.347954 -0.110243,0.682127 -0.330729,1.00252 -0.220485,0.316948 -0.523653,0.549491 -0.909502,0.69763 -0.382404,0.144693 -0.969397,0.211672 -1.758317,0.213947 l -1.422176,0.0041 c 0.042,-0.145886 -0.655226,-1.029139 -0.812687,-1.245387 L 38.6889,84.657485 c -0.196632,-0.387874 0.34398,-0.715379 0.244072,-0.829066 -0.134358,-0.151584 0.281201,-0.337173 0.01618,-0.348696 l -0.09508,-0.0041 0.179701,-0.191202 h 3.930573 c 0.564994,0 1.018023,0.04134 1.359086,0.124023 0.516763,0.124023 0.911225,0.344509 1.183387,0.661456 0.272161,0.313503 0.390672,0.823787 0.390672,1.233752 0,0.351399 -0.106798,0.666624 -0.320393,0.945676 -0.213595,0.275607 -0.52882,0.480589 -0.945675,0.614947 z m -4.715108,-0.279052 c 0.127468,0.02411 0.272162,0.04306 0.434081,0.05684 0.165364,0.01033 2.353502,0.0155 2.549872,0.0155 0.502982,0 0.880219,-0.0534 1.13171,-0.160196 0.254936,-0.110243 0.449583,-0.277329 0.583942,-0.50126 0.134358,-0.223931 0.201537,-0.468532 0.201537,-0.733803 0,-0.409965 -0.149517,-0.908191 -0.48369,-1.197578 -0.334173,-0.289387 -0.821652,-0.434081 -1.462438,-0.434081 -0.344509,0 -3.546537,-0.06775 -3.822144,0.008 z m 2.007271,3.348623 c 0.39963,0.09302 0.794092,0.139525 1.183387,0.139525 0.62356,0 1.098982,-0.139526 1.426265,-0.418577 0.327283,-0.282497 0.490924,-0.630451 0.490924,-1.043861 0,-0.272161 -0.07407,-0.533988 -0.222208,-0.785479 -0.148139,-0.251491 -0.389295,-0.449584 -0.723468,-0.594277 -0.334173,-0.144694 -0.747583,-0.217041 -1.24023,-0.217041 -0.213595,0 -2.403456,0.0034 -2.555039,0.01034 -0.151584,0.0069 -0.273885,0.01894 -0.366902,0.03617 z",
              style: "font-family:'Times New Roman';-inkscape-font-specification:'Times New Roman, ';fill:#d8e9ef;fill-opacity:1",
              id: "path326"
            })
          }),
          /* @__PURE__ */ jsx("path", {
            id: "rect13453",
            style: "fill:#0E0E11;stroke-width:0.264583",
            d: "m 38.406507,84.302044 0.438282,-1.019819 0.179353,6.39e-4 3.0065,7.171582 -1.072838,0.0058 z"
          })
        ]
      })
    ]
  })
});
const ContentContext = /* @__PURE__ */ createContext$1("qc-c");
const ContentInternalContext = /* @__PURE__ */ createContext$1("qc-ic");
const DocumentHeadContext = /* @__PURE__ */ createContext$1("qc-h");
const RouteLocationContext = /* @__PURE__ */ createContext$1("qc-l");
const RouteNavigateContext = /* @__PURE__ */ createContext$1("qc-n");
const RouterOutlet = /* @__PURE__ */ componentQrl(inlinedQrl(() => {
  const { contents } = useContext(ContentInternalContext);
  if (contents && contents.length > 0) {
    const contentsLen = contents.length;
    let cmp = null;
    for (let i = contentsLen - 1; i >= 0; i--)
      cmp = jsx(contents[i].default, {
        children: cmp
      });
    return cmp;
  }
  return SkipRender;
}, "RouterOutlet_component_nd8yk3KO22c"));
const MODULE_CACHE$1 = /* @__PURE__ */ new WeakMap();
const loadRoute$1 = async (routes2, menus2, cacheModules2, pathname) => {
  if (Array.isArray(routes2))
    for (const route of routes2) {
      const match = route[0].exec(pathname);
      if (match) {
        const loaders = route[1];
        const params = getRouteParams$1(route[2], match);
        const routeBundleNames = route[4];
        const mods = new Array(loaders.length);
        const pendingLoads = [];
        const menuLoader = getMenuLoader$1(menus2, pathname);
        let menu = void 0;
        loaders.forEach((moduleLoader, i) => {
          loadModule$1(moduleLoader, pendingLoads, (routeModule) => mods[i] = routeModule, cacheModules2);
        });
        loadModule$1(menuLoader, pendingLoads, (menuModule) => menu = menuModule == null ? void 0 : menuModule.default, cacheModules2);
        if (pendingLoads.length > 0)
          await Promise.all(pendingLoads);
        return [
          params,
          mods,
          menu,
          routeBundleNames
        ];
      }
    }
  return null;
};
const loadModule$1 = (moduleLoader, pendingLoads, moduleSetter, cacheModules2) => {
  if (typeof moduleLoader === "function") {
    const loadedModule = MODULE_CACHE$1.get(moduleLoader);
    if (loadedModule)
      moduleSetter(loadedModule);
    else {
      const l = moduleLoader();
      if (typeof l.then === "function")
        pendingLoads.push(l.then((loadedModule2) => {
          if (cacheModules2 !== false)
            MODULE_CACHE$1.set(moduleLoader, loadedModule2);
          moduleSetter(loadedModule2);
        }));
      else if (l)
        moduleSetter(l);
    }
  }
};
const getMenuLoader$1 = (menus2, pathname) => {
  if (menus2) {
    const menu = menus2.find((m) => m[0] === pathname || pathname.startsWith(m[0] + (pathname.endsWith("/") ? "" : "/")));
    if (menu)
      return menu[1];
  }
  return void 0;
};
const getRouteParams$1 = (paramNames, match) => {
  const params = {};
  if (paramNames)
    for (let i = 0; i < paramNames.length; i++)
      params[paramNames[i]] = match ? match[i + 1] : "";
  return params;
};
const resolveHead = (endpoint, routeLocation, contentModules) => {
  const head2 = createDocumentHead();
  const headProps = {
    data: endpoint ? endpoint.body : null,
    head: head2,
    ...routeLocation
  };
  for (let i = contentModules.length - 1; i >= 0; i--) {
    const contentModuleHead = contentModules[i] && contentModules[i].head;
    if (contentModuleHead) {
      if (typeof contentModuleHead === "function")
        resolveDocumentHead(head2, contentModuleHead(headProps));
      else if (typeof contentModuleHead === "object")
        resolveDocumentHead(head2, contentModuleHead);
    }
  }
  return headProps.head;
};
const resolveDocumentHead = (resolvedHead, updatedHead) => {
  if (typeof updatedHead.title === "string")
    resolvedHead.title = updatedHead.title;
  mergeArray(resolvedHead.meta, updatedHead.meta);
  mergeArray(resolvedHead.links, updatedHead.links);
  mergeArray(resolvedHead.styles, updatedHead.styles);
};
const mergeArray = (existingArr, newArr) => {
  if (Array.isArray(newArr))
    for (const newItem of newArr) {
      if (typeof newItem.key === "string") {
        const existingIndex = existingArr.findIndex((i) => i.key === newItem.key);
        if (existingIndex > -1) {
          existingArr[existingIndex] = newItem;
          continue;
        }
      }
      existingArr.push(newItem);
    }
};
const createDocumentHead = () => ({
  title: "",
  meta: [],
  links: [],
  styles: []
});
const useDocumentHead = () => useContext(DocumentHeadContext);
const useLocation = () => useContext(RouteLocationContext);
const useNavigate = () => useContext(RouteNavigateContext);
const useQwikCityEnv = () => noSerialize(useEnvData("qwikcity"));
const toPath = (url) => url.pathname + url.search + url.hash;
const toUrl = (url, baseUrl) => new URL(url, baseUrl.href);
const isSameOrigin = (a2, b) => a2.origin === b.origin;
const isSamePath = (a2, b) => a2.pathname + a2.search === b.pathname + b.search;
const isSamePathname = (a2, b) => a2.pathname === b.pathname;
const isSameOriginDifferentPathname = (a2, b) => isSameOrigin(a2, b) && !isSamePath(a2, b);
const getClientEndpointPath = (pathname) => pathname + (pathname.endsWith("/") ? "" : "/") + "q-data.json";
const getClientNavPath = (props, baseUrl) => {
  const href = props.href;
  if (typeof href === "string" && href.trim() !== "" && typeof props.target !== "string")
    try {
      const linkUrl = toUrl(href, baseUrl);
      const currentUrl = toUrl("", baseUrl);
      if (isSameOrigin(linkUrl, currentUrl))
        return toPath(linkUrl);
    } catch (e) {
      console.error(e);
    }
  return null;
};
const getPrefetchUrl = (props, clientNavPath, currentLoc) => {
  if (props.prefetch && clientNavPath) {
    const prefetchUrl = toUrl(clientNavPath, currentLoc);
    if (!isSamePathname(prefetchUrl, toUrl("", currentLoc)))
      return prefetchUrl + "";
  }
  return null;
};
const clientNavigate = (win, routeNavigate) => {
  const currentUrl = win.location;
  const newUrl = toUrl(routeNavigate.path, currentUrl);
  if (isSameOriginDifferentPathname(currentUrl, newUrl)) {
    handleScroll(win, currentUrl, newUrl);
    win.history.pushState("", "", toPath(newUrl));
  }
  if (!win[CLIENT_HISTORY_INITIALIZED]) {
    win[CLIENT_HISTORY_INITIALIZED] = 1;
    win.addEventListener("popstate", () => {
      const currentUrl2 = win.location;
      const previousUrl = toUrl(routeNavigate.path, currentUrl2);
      if (isSameOriginDifferentPathname(currentUrl2, previousUrl)) {
        handleScroll(win, previousUrl, currentUrl2);
        routeNavigate.path = toPath(currentUrl2);
      }
    });
  }
};
const handleScroll = async (win, previousUrl, newUrl) => {
  const doc = win.document;
  const newHash = newUrl.hash;
  if (isSamePath(previousUrl, newUrl)) {
    if (previousUrl.hash !== newHash) {
      await domWait();
      if (newHash)
        scrollToHashId(doc, newHash);
      else
        win.scrollTo(0, 0);
    }
  } else {
    if (newHash)
      for (let i = 0; i < 24; i++) {
        await domWait();
        if (scrollToHashId(doc, newHash))
          break;
      }
    else {
      await domWait();
      win.scrollTo(0, 0);
    }
  }
};
const domWait = () => new Promise((resolve) => setTimeout(resolve, 12));
const scrollToHashId = (doc, hash) => {
  const elmId = hash.slice(1);
  const elm = doc.getElementById(elmId);
  if (elm)
    elm.scrollIntoView();
  return elm;
};
const dispatchPrefetchEvent = (prefetchData) => dispatchEvent(new CustomEvent("qprefetch", {
  detail: prefetchData
}));
const CLIENT_HISTORY_INITIALIZED = /* @__PURE__ */ Symbol();
const loadClientData = async (href) => {
  const { cacheModules: cacheModules2 } = await Promise.resolve().then(() => _qwikCityPlan);
  const pagePathname = new URL(href).pathname;
  const endpointUrl = getClientEndpointPath(pagePathname);
  const now = Date.now();
  const expiration = cacheModules2 ? 6e5 : 15e3;
  const cachedClientPageIndex = cachedClientPages.findIndex((c) => c.u === endpointUrl);
  let cachedClientPageData = cachedClientPages[cachedClientPageIndex];
  dispatchPrefetchEvent({
    links: [
      pagePathname
    ]
  });
  if (!cachedClientPageData || cachedClientPageData.t + expiration < now) {
    cachedClientPageData = {
      u: endpointUrl,
      t: now,
      c: new Promise((resolve) => {
        fetch(endpointUrl).then((clientResponse) => {
          const contentType = clientResponse.headers.get("content-type") || "";
          if (clientResponse.ok && contentType.includes("json"))
            clientResponse.json().then((clientData) => {
              dispatchPrefetchEvent({
                bundles: clientData.prefetch,
                links: [
                  pagePathname
                ]
              });
              resolve(clientData);
            }, () => resolve(null));
          else
            resolve(null);
        }, () => resolve(null));
      })
    };
    for (let i = cachedClientPages.length - 1; i >= 0; i--)
      if (cachedClientPages[i].t + expiration < now)
        cachedClientPages.splice(i, 1);
    cachedClientPages.push(cachedClientPageData);
  }
  cachedClientPageData.c.catch((e) => console.error(e));
  return cachedClientPageData.c;
};
const cachedClientPages = [];
const QwikCity = /* @__PURE__ */ componentQrl(inlinedQrl(() => {
  const env = useQwikCityEnv();
  if (!(env == null ? void 0 : env.params))
    throw new Error(`Missing Qwik City Env Data`);
  const urlEnv = useEnvData("url");
  if (!urlEnv)
    throw new Error(`Missing Qwik URL Env Data`);
  const url = new URL(urlEnv);
  const routeLocation = useStore({
    href: url.href,
    pathname: url.pathname,
    query: Object.fromEntries(url.searchParams.entries()),
    params: env.params
  });
  const routeNavigate = useStore({
    path: toPath(url)
  });
  const documentHead = useStore(createDocumentHead);
  const content = useStore({
    headings: void 0,
    menu: void 0
  });
  const contentInternal = useStore({
    contents: void 0
  });
  useContextProvider(ContentContext, content);
  useContextProvider(ContentInternalContext, contentInternal);
  useContextProvider(DocumentHeadContext, documentHead);
  useContextProvider(RouteLocationContext, routeLocation);
  useContextProvider(RouteNavigateContext, routeNavigate);
  useWatchQrl(inlinedQrl(async ({ track }) => {
    const [content2, contentInternal2, documentHead2, env2, routeLocation2, routeNavigate2] = useLexicalScope();
    const { routes: routes2, menus: menus2, cacheModules: cacheModules2 } = await Promise.resolve().then(() => _qwikCityPlan);
    const path = track(routeNavigate2, "path");
    const url2 = new URL(path, routeLocation2.href);
    const pathname = url2.pathname;
    const loadRoutePromise = loadRoute$1(routes2, menus2, cacheModules2, pathname);
    const endpointResponse = isServer ? env2.response : loadClientData(url2.href);
    const loadedRoute = await loadRoutePromise;
    if (loadedRoute) {
      const [params, mods, menu] = loadedRoute;
      const contentModules = mods;
      const pageModule = contentModules[contentModules.length - 1];
      routeLocation2.href = url2.href;
      routeLocation2.pathname = pathname;
      routeLocation2.params = {
        ...params
      };
      routeLocation2.query = Object.fromEntries(url2.searchParams.entries());
      content2.headings = pageModule.headings;
      content2.menu = menu;
      contentInternal2.contents = noSerialize(contentModules);
      const clientPageData = await endpointResponse;
      const resolvedHead = resolveHead(clientPageData, routeLocation2, contentModules);
      documentHead2.links = resolvedHead.links;
      documentHead2.meta = resolvedHead.meta;
      documentHead2.styles = resolvedHead.styles;
      documentHead2.title = resolvedHead.title;
      if (isBrowser)
        clientNavigate(window, routeNavigate2);
    }
  }, "QwikCity_component_useWatch_AaAlzKH0KlQ", [
    content,
    contentInternal,
    documentHead,
    env,
    routeLocation,
    routeNavigate
  ]));
  return /* @__PURE__ */ jsx(Slot, {});
}, "QwikCity_component_z1nvHyEppoI"));
/* @__PURE__ */ componentQrl(inlinedQrl((props) => {
  const nav = useNavigate();
  const loc = useLocation();
  const originalHref = props.href;
  const linkProps = {
    ...props
  };
  const clientNavPath = getClientNavPath(linkProps, loc);
  const prefetchUrl = getPrefetchUrl(props, clientNavPath, loc);
  linkProps["preventdefault:click"] = !!clientNavPath;
  linkProps.href = clientNavPath || originalHref;
  return /* @__PURE__ */ jsx("a", {
    ...linkProps,
    onClick$: inlinedQrl(() => {
      const [clientNavPath2, linkProps2, nav2] = useLexicalScope();
      if (clientNavPath2)
        nav2.path = linkProps2.href;
    }, "Link_component_a_onClick_hA9UPaY8sNQ", [
      clientNavPath,
      linkProps,
      nav
    ]),
    "data-prefetch": prefetchUrl,
    onMouseOver$: inlinedQrl((_, elm) => prefetchLinkResources(elm), "Link_component_a_onMouseOver_skxgNVWVOT8"),
    onQVisible$: inlinedQrl((_, elm) => prefetchLinkResources(elm, true), "Link_component_a_onQVisible_uVE5iM9H73c"),
    children: /* @__PURE__ */ jsx(Slot, {})
  });
}, "Link_component_mYsiJcA4IBc"));
const prefetchLinkResources = (elm, isOnVisible) => {
  var _a2;
  const prefetchUrl = (_a2 = elm == null ? void 0 : elm.dataset) == null ? void 0 : _a2.prefetch;
  if (prefetchUrl) {
    if (!windowInnerWidth)
      windowInnerWidth = window.innerWidth;
    if (!isOnVisible || isOnVisible && windowInnerWidth < 520)
      loadClientData(prefetchUrl);
  }
};
let windowInnerWidth = 0;
const swRegister = '((s,a,r,i)=>{r=(e,t)=>{t=document.querySelector("[q\\\\:base]"),t&&a.active&&a.active.postMessage({type:"qprefetch",base:t.getAttribute("q:base"),...e})},addEventListener("qprefetch",e=>{const t=e.detail;a?r(t):t.bundles&&s.push(...t.bundles)}),navigator.serviceWorker.register("/service-worker.js").then(e=>{i=()=>{a=e,r({bundles:s})},e.installing?e.installing.addEventListener("statechange",t=>{t.target.state=="activated"&&i()}):e.active&&i()}).catch(e=>console.error(e))})([])';
const ServiceWorkerRegister = () => jsx("script", {
  dangerouslySetInnerHTML: swRegister
});
const ChangeLocale = /* @__PURE__ */ componentQrl(inlinedQrl(() => {
  const loc = useLocation();
  const nav = useNavigate();
  const ctx = useSpeakContext();
  const changeLocale$ = inlinedQrl(async (locale) => {
    const [ctx2, loc2, nav2] = useLexicalScope();
    await changeLocale(locale, ctx2);
    document.cookie = `locale=${JSON.stringify(locale)};max-age=86400;path=/`;
    let pathname = loc2.pathname;
    if (loc2.params.lang) {
      if (locale.lang !== config.defaultLocale.lang)
        pathname = pathname.replace(loc2.params.lang, locale.lang);
      else
        pathname = pathname.replace(new RegExp(`(/${loc2.params.lang}/)|(/${loc2.params.lang}$)`), "/");
    } else if (locale.lang !== config.defaultLocale.lang)
      pathname = `/${locale.lang}${pathname}`;
    nav2.path = pathname;
  }, "s_YUHyy9C71gg", [
    ctx,
    loc,
    nav
  ]);
  return /* @__PURE__ */ jsx("div", {
    class: "change-locale",
    children: ctx.config.supportedLocales.map((locale) => /* @__PURE__ */ jsx("div", {
      class: {
        active: locale.lang == ctx.locale.lang,
        btn_lang: true
      },
      onClick$: inlinedQrl(async () => {
        const [changeLocale$2, locale2] = useLexicalScope();
        return await changeLocale$2(locale2);
      }, "s_EAv00I00cOE", [
        changeLocale$,
        locale
      ]),
      children: /* @__PURE__ */ jsx("img", {
        src: `lang/${locale.lang}.webp`
      })
    }))
  });
}, "s_fykAOQuHiRY"));
const index = /* @__PURE__ */ componentQrl(inlinedQrl(() => {
  const loc = useSpeakLocale();
  useStylesScopedQrl(inlinedQrl(styles$1, "s_huoEr0HZ0fo"));
  const state = useStore({
    currentPage: "home",
    expAppearing: false,
    skillsAppearing: false,
    menuActive: false,
    currentSkill: "none",
    experience: [
      {
        poste: "Full Stack D\xE9veloppeur",
        time: {
          start: new Date("July 2019"),
          end: new Date("January 2021")
        },
        entreprise: "Mwesto Labs - AppiMonkey",
        technos: [
          "Docker",
          "Unity",
          "C#",
          "NodeJS",
          "RethinkDB",
          "Pug"
        ],
        description: {
          "fr-FR": `En tant que full stack d\xE9veloppeur stagiaire chez Mwesto Labs, j'ai eu l'opportunit\xE9 d\u2019\xEAtre encadr\xE9 par une \xE9quipe de d\xE9veloppeurs talentueux sur AppiMonkey, une application SaaS. J'ai \xE9galement d\xE9velopp\xE9 une r\xE9gie publicitaires, des concours en temps r\xE9el et des jeux en r\xE9alit\xE9 augment\xE9e pour nos clients et j'ai travaill\xE9 en \xE9troite collaboration avec notre \xE9quipe de designers pour assurer une exp\xE9rience utilisateur exceptionnelle.
          Apr\xE8s quelques mois j\u2019ai \xE9t\xE9 promu lead d\xE9veloppeur, j'ai \xE9t\xE9 responsable de g\xE9rer les serveurs, le CICD et tout le d\xE9veloppement seul. Par apr\xE8s, deux stagiaires sont venus pour apprendre les bases du m\xE9tier.`,
          "en-EN": `
          As a full stack developer intern at Mwesto Labs, I had the opportunity to be mentored by a team of talented developers on AppiMonkey, a SaaS application. I also developed advertising, real-time contests and augmented reality games for our clients and worked closely with our design team to ensure an exceptional user experience.
          After a few months I was promoted to lead developer, I was responsible for managing the servers, the CICD and all the development alone. Afterwards, two trainees came to learn the basics of the job.`,
          "nl-NL": `
          Als full-stack developer-stagiair bij Mwesto Labs kreeg ik de kans om begeleid te worden door een team van getalenteerde ontwikkelaars op AppiMonkey, een SaaS-applicatie. Ik ontwikkelde ook advertenties, real-time wedstrijden en augmented reality-games voor onze klanten en werkte nauw samen met ons ontwerpteam om een uitzonderlijke gebruikerservaring te garanderen.
          Na een paar maanden werd ik gepromoveerd tot hoofdontwikkelaar, ik was alleen verantwoordelijk voor het beheer van de servers, de CICD en de hele ontwikkeling. Daarna kwamen twee stagiaires de basis van het vak leren.`,
          "it-IT": `
          In qualit\xE0 di stagista sviluppatore full stack da Mwesto Labs, ho avuto l'opportunit\xE0 di essere guidato da un team di sviluppatori di talento su AppiMonkey, un'applicazione SaaS. Ho anche sviluppato pubblicit\xE0, concorsi in tempo reale e giochi di realt\xE0 aumentata per i nostri clienti e ho lavorato a stretto contatto con il nostro team di design per garantire un'esperienza utente eccezionale.
          Dopo pochi mesi sono stato promosso a lead developer, ero responsabile della gestione dei server, del CICD e di tutto lo sviluppo da solo. Successivamente, sono venuti due apprendisti per imparare le basi del lavoro.`,
          "sp-SP": `
          Como pasante de desarrollador Full Stack en Mwesto Labs, tuve la oportunidad de ser asesorado por un equipo de desarrolladores talentosos en AppiMonkey, una aplicaci\xF3n SaaS. Tambi\xE9n desarroll\xE9 publicidad, concursos en tiempo real y juegos de realidad aumentada para nuestros clientes y trabaj\xE9 en estrecha colaboraci\xF3n con nuestro equipo de dise\xF1o para garantizar una experiencia de usuario excepcional.
          Despu\xE9s de unos meses fui ascendido a desarrollador l\xEDder, yo solo era responsable de administrar los servidores, el CICD y todo el desarrollo. Posteriormente, dos aprendices vinieron a aprender los conceptos b\xE1sicos del trabajo.`
        },
        img: "AppiMonkey.webp",
        job: true
      },
      {
        poste: "Web developpeur",
        time: {
          start: new Date("January 2019"),
          end: new Date("July 2019")
        },
        technos: [
          "Docker",
          "PHP",
          "Slim",
          "Laravel",
          "SCSS",
          "NodeJS",
          "PostgreSQL",
          "Twig",
          "React",
          "Javascript"
        ],
        entreprise: "BeCode",
        description: {
          "fr-FR": `Pendant ma p\xE9riode au centre de formation BeCode, j'ai eu l'opportunit\xE9 de me former en tant que d\xE9veloppeur full stack. J'ai suivi une formation intensive en apprentissage du code, couvrant les langages de programmation tels que JavaScript, PHP et SCSS.
          Gr\xE2ce \xE0 des projets en groupe, j'ai pu mettre en pratique mes connaissances et d\xE9velopper mes comp\xE9tences en d\xE9veloppement. Le centre de formation m'a \xE9galement fourni des ressources pr\xE9cieuses et un soutien continu pour m'aider \xE0 atteindre mes objectifs professionnels.`,
          "en-EN": `
          During my period at the BeCode training center, I had the opportunity to train myself as a full stack developer. I followed an intensive training in learning to code, covering programming languages such as JavaScript, PHP and SCSS.
          Thanks to group projects, I was able to put my knowledge into practice and develop my development skills. The training center has also provided me with valuable resources and ongoing support to help me achieve my career goals.`,
          "nl-NL": `
          Tijdens mijn periode bij het BeCode opleidingscentrum kreeg ik de kans om mezelf op te leiden tot full stack developer. Ik volgde een intensieve training in het leren coderen, waarin programmeertalen als JavaScript, PHP en SCSS aan bod kwamen.
          Dankzij groepsprojecten heb ik mijn kennis in de praktijk kunnen brengen en mijn ontwikkelingsvaardigheden kunnen ontwikkelen. Het trainingscentrum heeft me ook waardevolle middelen en voortdurende ondersteuning gegeven om me te helpen mijn professionele doelen te bereiken.`,
          "it-IT": `
          Durante il mio periodo al centro di formazione BeCode, ho avuto l'opportunit\xE0 di formarmi come sviluppatore full stack. Ho seguito una formazione intensiva nell'apprendimento del codice, coprendo linguaggi di programmazione come JavaScript, PHP e SCSS.
          Grazie ai progetti di gruppo ho potuto mettere in pratica le mie conoscenze e sviluppare le mie capacit\xE0 di sviluppo. Il centro di formazione mi ha inoltre fornito risorse preziose e supporto continuo per aiutarmi a raggiungere i miei obiettivi professionali.`,
          "sp-SP": `
          Durante mi etapa en el centro de formaci\xF3n de BeCode, tuve la oportunidad de formarme como desarrollador full stack. Segu\xED una formaci\xF3n intensiva en el aprendizaje de la programaci\xF3n, abarcando lenguajes de programaci\xF3n como JavaScript, PHP y SCSS.
          Gracias a los proyectos en equipa, pude poner en pr\xE1ctica mis conocimientos y desarrollar mis habilidades de desarrollo. El centro de formaci\xF3n tambi\xE9n me ha proporcionado valiosos recursos y apoyo continuo para ayudarme a alcanzar mis objetivos profesionales.`
        },
        img: "logo-becode.webp",
        job: false
      },
      {
        poste: "Steward Urbain",
        time: {
          start: new Date("August 2017"),
          end: new Date("August 2018")
        },
        technos: [],
        entreprise: "Liege Gestion Centre Ville",
        description: {
          "fr-FR": `Durant ma p\xE9riode o\xF9 j\u2019ai travaill\xE9 \xE0 Li\xE8ge Gestion du Centre Ville, j'ai \xE9t\xE9 en charge de la gestion du parc informatique de l'organisation. Cela incluait l'encodage de datas, l\u2019installation de nouveaux hardwares et la r\xE9solution de probl\xE8mes techniques.
          Au cours de cette exp\xE9rience, j'ai d\xE9velopp\xE9 une grande autonomie de travail et j'ai appris \xE0 prendre des d\xE9cisions rapidement dans un environnement professionnel. J'ai \xE9galement appris \xE0 travailler efficacement en \xE9quipe et \xE0 communiquer avec mes coll\xE8gues pour atteindre nos objectifs communs`,
          "en-EN": `
          During my period when I worked at Li\xE8ge Gestion du Center Ville, I was in charge of managing the organization's IT equipment. This included encoding data, installing new hardware and solving technical problems.
          During this experience, I developed a great autonomy of work and I learned to make decisions quickly in a professional environment. I also learned how to work effectively in a team and how to communicate with my colleagues to achieve our common goals.`,
          "nl-NL": `
          Tijdens mijn periode dat ik bij Li\xE8ge Gestion du Centre Ville werkte, was ik verantwoordelijk voor het beheer van de IT-apparatuur van de organisatie. Dit omvatte het coderen van gegevens, het installeren van nieuwe hardware en het oplossen van technische problemen.
          Tijdens deze ervaring ontwikkelde ik een grote autonomie in mijn werk en leerde ik snel beslissingen te nemen in een professionele omgeving. Ik heb ook geleerd hoe ik effectief in een team kan werken en hoe ik met mijn collega's kan communiceren om onze gemeenschappelijke doelen te bereiken.`,
          "it-IT": `
          Durante il mio periodo in cui ho lavorato al Li\xE8ge Gestion du Centre Ville, ero responsabile della gestione delle apparecchiature informatiche dell'organizzazione. Ci\xF2 includeva la codifica dei data, l'installazione di nuovo hardware e la risoluzione di problemi tecnici.
          Durante questa esperienza ho sviluppato una grande autonomia di lavoro e ho imparato a prendere decisioni velocemente in un ambiente professionale. Ho anche imparato a lavorare efficacemente in squadra ea comunicare con i miei colleghi per raggiungere i nostri obiettivi comuni.`,
          "sp-SP": `
          Durante mi per\xEDodo en el que trabaj\xE9 en Li\xE8ge Gestion du Centre Ville, estaba a cargo de administrar el IT de la organizaci\xF3n. Esto incluy\xF3 la codificaci\xF3n de datas, la instalaci\xF3n de nuevo hardware y la resoluci\xF3n de problemas t\xE9cnicos.
          Durante esta experiencia, desarroll\xE9 una gran autonom\xEDa de trabajo y aprend\xED a tomar decisiones r\xE1pidamente en un entorno profesional. Tambi\xE9n aprend\xED a trabajar en equipo de manera efectiva y a comunicarme con mis colegas para lograr nuestros objetivos comunes`
        },
        img: "Logo-blanc-sans-fond.webp",
        job: true
      },
      {
        poste: "Concepteur Multimedia",
        time: {
          start: new Date("September 2011"),
          end: new Date("June 2013")
        },
        entreprise: "IFAPME",
        technos: [
          "PHP",
          "HTML",
          "CSS",
          "Javascript"
        ],
        description: {
          "fr-FR": `Au cours de ma formation \xE0 l'IFAPME, j'ai eu l'opportunit\xE9 de me familiariser avec les bases de la programmation informatique. J'ai particip\xE9 \xE0 des cours th\xE9oriques sur l'introduction \xE0 la programmation et j'ai \xE9galement eu l'occasion de mettre en pratique mes connaissances en utilisant des UML pour analyser et comprendre le code de programmes existants.
          En plus de ma formation en programmation, j'ai \xE9galement appris les bases du graphisme num\xE9rique. J'ai utilis\xE9 des outils tels que PHP et WordPress pour cr\xE9er des sites Web professionnels et attrayants.`,
          "en-EN": `
          During my training at IFAPME, I had the opportunity to familiarize myself with the basics of computer programming. I participated in theoretical courses on the introduction to programming and I also had the opportunity to put my knowledge into practice by using UML to analyze and understand the code of existing programs.
          In addition to my training in programming, I also learned the basics of digital graphics. I used tools such as PHP and WordPress to create professional and attractive websites.`,
          "nl-NL": `
          Tijdens mijn opleiding bij IFAPME kreeg ik de kans om vertrouwd te raken met de basisprincipes van computerprogrammering. Ik nam deel aan theoretische cursussen over de introductie van programmeren en ik kreeg ook de kans om mijn kennis in de praktijk te brengen door UML te gebruiken om de code van bestaande programma's te analyseren en te begrijpen.
          Naast mijn opleiding in programmeren, heb ik ook de basis van digitale grafische afbeeldingen geleerd. Ik gebruikte tools zoals PHP en WordPress om professionele en aantrekkelijke websites te maken.`,
          "it-IT": `
          Durante la mia formazione al IFAPME, ho avuto l'opportunit\xE0 di familiarizzarmi con le basi della programmazione informatica. Ho partecipato a corsi teorici sull'introduzione alla programmazione e ho avuto anche l'opportunit\xE0 di mettere in pratica le mie conoscenze utilizzando UML per analizzare e comprendere il codice dei programmi esistenti.
          Oltre alla mia formazione in programmazione, ho appreso anche le basi della grafica digitale. Ho utilizzato strumenti come PHP e WordPress per creare siti web professionali e accattivanti.`,
          "sp-SP": `
          Durante mi formaci\xF3n en IFAPME, tuve la oportunidad de familiarizarme con los conceptos b\xE1sicos de programaci\xF3n inform\xE1tica. Particip\xE9 en cursos te\xF3ricos de introducci\xF3n a la programaci\xF3n y tambi\xE9n tuve la oportunidad de poner en pr\xE1ctica mis conocimientos utilizando UML para analizar y comprender el c\xF3digo de los programas existentes.
          Adem\xE1s de mi formaci\xF3n en programaci\xF3n, tambi\xE9n aprend\xED los conceptos b\xE1sicos de gr\xE1ficos digitales. Us\xE9 herramientas como PHP y WordPress para crear sitios web profesionales y atractivos.`
        },
        img: "ifapme.webp",
        job: false
      },
      {
        poste: "Informatique",
        time: {
          start: new Date("September 2006"),
          end: new Date("June 2008")
        },
        entreprise: "Institut Saint-Jean Berchmans",
        technos: [
          "Python"
        ],
        description: {
          "fr-FR": `Au cours de mon apprentissage scolaire \xE0 l'Institut Saint Jean Berchmans, j'ai eu l'opportunit\xE9 de me familiariser avec les bases de la programmation informatique. J'ai suivi des cours sur l'introduction \xE0 la programmation en utilisant le langage Python, et j'ai \xE9galement particip\xE9 \xE0 des projets de robotique o\xF9 j'ai mis en pratique mes connaissances en programmation pour contr\xF4ler des robots et les faire ex\xE9cuter diff\xE9rentes t\xE2ches.
          En plus de ma formation en programmation et en robotique, j'ai \xE9galement eu l'occasion de me familiariser avec l'informatique en g\xE9n\xE9ral. J'ai appris \xE0 utiliser diff\xE9rents syst\xE8mes d'exploitation et \xE0 r\xE9soudre des probl\xE8mes courants qui peuvent survenir sur un ordinateur. `,
          "en-EN": `
          During my training at the Institut Saint Jean Berchmans, I had the opportunity to familiarize myself with the basics of computer programming. I took courses on introduction to programming using the Python language, and I also participated in robotics projects where I applied my programming knowledge to control robots and make them perform different tasks.`,
          "nl-NL": `
          Tijdens mijn opleiding aan het Institut Saint Jean Berchmans kreeg ik de kans om vertrouwd te raken met de basisprincipes van computerprogrammering. Ik volgde cursussen voor introductie tot programmeren met behulp van de Python-taal, en ik nam ook deel aan robotica-projecten waar ik mijn programmeerkennis toepaste om robots te besturen en verschillende taken te laten uitvoeren.`,
          "it-IT": `
          Durante la mia formazione al Institut Saint Jean Berchmans, ho avuto l'opportunit\xE0 di familiarizzarmi con le basi della programmazione informatica. Ho seguito corsi di introduzione alla programmazione utilizzando il linguaggio Python, e ho anche partecipato a progetti di robotica dove ho applicato le mie conoscenze di programmazione per controllare robot e fargli svolgere compiti diversi.`,
          "sp-SP": `
          Durante mi formaci\xF3n en el Institut Saint Jean Berchmans, tuve la oportunidad de familiarizarme con los conceptos b\xE1sicos de programaci\xF3n inform\xE1tica. Realic\xE9 cursos de introducci\xF3n a la programaci\xF3n utilizando el lenguaje Python, y tambi\xE9n particip\xE9 en proyectos de rob\xF3tica donde apliqu\xE9 mis conocimientos de programaci\xF3n para controlar robots y hacerlos realizar diferentes tareas.`
        },
        img: "header_transparent.webp",
        job: false
      }
    ],
    skills: {
      Frontend: [
        {
          techno: "React",
          description: `React est une biblioth\xE8que JavaScript libre d\xE9velopp\xE9e par Facebook depuis 2013. Le but principal de cette biblioth\xE8que est de faciliter la cr\xE9ation d'application web monopage, via la cr\xE9ation de composants d\xE9pendant d'un \xE9tat et g\xE9n\xE9rant une page HTML \xE0 chaque changement d'\xE9tat.
          React est une biblioth\xE8que qui ne g\xE8re que l'interface de l'application, consid\xE9r\xE9 comme la vue dans le mod\xE8le MVC. Elle peut ainsi \xEAtre utilis\xE9e avec une autre biblioth\xE8que ou un framework MVC comme AngularJS. La biblioth\xE8que se d\xE9marque de ses concurrents par sa flexibilit\xE9 et ses performances, en travaillant avec un DOM virtuel et en ne mettant \xE0 jour le rendu dans le navigateur qu'en cas de n\xE9cessit\xE9.`,
          link: "https://fr.reactjs.org/"
        },
        {
          techno: "AstroJS",
          description: `Astro est un nouveau type de constructeur de site statique qui offre des performances ultra-rapides avec une exp\xE9rience de d\xE9veloppement moderne. Vous pouvez construire votre site en utilisant React, Svelte, Vue, Preact, des composants Web ou tout simplement HTML + JavaScript. Astro rend votre page enti\xE8re en HTML statique, supprimant par d\xE9faut tout JavaScript de votre version finale.`,
          link: "https://astro.build/"
        },
        {
          techno: "HTML",
          description: `Le HyperText Markup Language est le langage de balisage con\xE7u pour repr\xE9senter les pages web.

        Ce langage permet d\u2019\xE9crire de l\u2019hypertexte (d\u2019o\xF9 son nom), de structurer s\xE9mantiquement une page web, de mettre en forme du contenu, de cr\xE9er des formulaires de saisie ou encore d\u2019inclure des ressources multim\xE9dias dont des images, des vid\xE9os, et des programmes informatiques. L'HTML offre \xE9galement la possibilit\xE9 de cr\xE9er des documents interop\xE9rables avec des \xE9quipements tr\xE8s vari\xE9s et conform\xE9ment aux exigences de l\u2019accessibilit\xE9 du web. `,
          link: "#"
        },
        {
          techno: "Javascript",
          description: "JavaScript est un langage de programmation de scripts principalement employ\xE9 dans les pages web interactives et \xE0 ce titre est une partie essentielle des applications web. En outre, les fonctions sont des objets de premi\xE8re classe. Le langage supporte le paradigme objet, imp\xE9ratif et fonctionnel.",
          link: "https://www.javascript.com/"
        },
        {
          techno: "Unity",
          description: "Unity est un moteur de jeu multiplateforme (smartphone, ordinateur, consoles de jeux vid\xE9o et Web) d\xE9velopp\xE9 par Unity Technologies. Il est l'un des plus r\xE9pandus dans l'industrie du jeu vid\xE9o, aussi bien pour les grands studios que pour les ind\xE9pendants du fait de sa rapidit\xE9 aux prototypages et qu'il permet de sortir les jeux sur tous les supports. ",
          link: "https://unity.com/"
        },
        {
          techno: "CSS",
          description: "",
          link: "#"
        },
        {
          techno: "SCSS",
          description: "Sass est un langage de script pr\xE9processeur qui est compil\xE9 ou interpr\xE9t\xE9 en CSS . Sass est disponible en deux syntaxes. La nouvelle syntaxe, \xABSCSS\xBB, utilise les m\xEAmes s\xE9parateurs de blocs que CSS. Les fichiers de la syntaxe indent\xE9e et SCSS utilisent respectivement les extensions .sass et .scss.",
          link: "https://sass-lang.com/"
        },
        {
          techno: "VueJS",
          description: "Vue.js , est un framework JavaScript open-source utilis\xE9 pour construire des interfaces utilisateur et des applications web monopages. Les fonctionnalit\xE9s avanc\xE9es requises pour les applications complexes telles que le routage, la gestion d'\xE9tat et les outils de construction sont offertes par le biais de biblioth\xE8ques et de paquets officiellement maintenus, Nuxt.js \xE9tant l'une des solutions les plus populaires. Les directives offrent des fonctionnalit\xE9s aux applications HTML, et sont soit int\xE9gr\xE9es soit d\xE9finies par l'utilisateur.",
          link: "https://vuejs.org/"
        },
        {
          techno: "Qwik",
          description: "Qwik est un framework d'applications Web centr\xE9 sur le DOM, con\xE7u pour le meilleur temps d'interaction possible, en se concentrant sur la possibilit\xE9 de reprendre le rendu c\xF4t\xE9 serveur du code HTML et le lazy loading en r\xE9duisant au maximum le code dans plusieurs fichiers. Le concept de base de Qwik est de se concentrer sur la m\xE9trique du temps d'interaction en retardant autant que possible JavaScript pour tirer parti des capacit\xE9s de lazy loading du navigateur. L'objectif de Qwik est de r\xE9duire le temps d'interaction en un clin d'\u0153il sur l'appareil mobile le plus lent",
          link: "https://qwik.builder.io/"
        },
        {
          techno: "Svelte",
          description: "Svelte est un framework JavaScript offrant une approche productive pour faciliter la cr\xE9ation d\u2019interfaces frontend. Le principal avantage technique de Svelte est qu\u2019il effectue la majeure partie de son travail lors de la compilation, ce qui se traduit par un JavaScript performant et convivial pour les navigateurs, avec des paquets de petite taille.",
          link: "https://svelte.dev/"
        },
        {
          techno: "Twig",
          description: "Twig est un moteur de templates pour le langage de programmation PHP, utilis\xE9 par d\xE9faut par le framework Symfony.",
          link: "https://twig.symfony.com/"
        },
        {
          techno: "Blazor",
          description: `Blazor est un framework Web .NET pour cr\xE9er des applications Web clientes avec C#.

        Blazor vous permet de cr\xE9er des interfaces utilisateur Web interactives en utilisant C # au lieu de JavaScript. Les applications Blazor sont compos\xE9es de composants d'interface utilisateur Web r\xE9utilisables impl\xE9ment\xE9s \xE0 l'aide de C#, HTML et CSS. Le code client et serveur est \xE9crit en C #, ce qui vous permet de partager du code et des biblioth\xE8ques.`,
          link: "https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor"
        }
      ],
      Backend: [
        {
          techno: "NodeJS",
          description: `En tant qu'environnement d'ex\xE9cution JavaScript asynchrone pilot\xE9 par les \xE9v\xE9nements, Node.js est con\xE7u pour cr\xE9er des applications r\xE9seau \xE9volutives. Il pr\xE9sente une boucle d'\xE9v\xE9nements comme une construction d'ex\xE9cution au lieu d'une biblioth\xE8que. Dans d'autres syst\xE8mes, il y a toujours un appel bloquant pour d\xE9marrer la boucle d'\xE9v\xE9nements. Node.js entre simplement dans la boucle d'\xE9v\xE9nements apr\xE8s avoir ex\xE9cut\xE9 le script d'entr\xE9e.

        Node.js quitte la boucle d'\xE9v\xE9nements lorsqu'il n'y a plus de rappels \xE0 effectuer.`,
          link: "https://nodejs.org"
        },
        {
          techno: "Laravel",
          description: `Laravel est un framework PHP open source, robuste et facile \xE0 comprendre. Il suit un mod\xE8le de conception mod\xE8le-vue-contr\xF4leur. Laravel r\xE9utilise les composants existants de diff\xE9rents frameworks, ce qui aide \xE0 cr\xE9er une application Web. L'application web ainsi con\xE7ue est plus structur\xE9e et pragmatique.`,
          link: "https://laravel.com"
        },
        {
          techno: "PHP",
          description: `PHP est un langage de scripts libre principalement utilis\xE9 pour produire des pages Web dynamiques via un serveur HTTP, mais pouvant \xE9galement fonctionner comme n'importe quel langage interpr\xE9t\xE9 de fa\xE7on locale, en ex\xE9cutant les programmes en ligne de commande. PHP est un langage imp\xE9ratif disposant depuis la version 5 de fonctionnalit\xE9s de mod\xE8le objet compl\xE8tes. En raison de la richesse de sa biblioth\xE8que, on d\xE9signe parfois PHP comme une plate-forme plus qu'un simple langage.PHP (sigle de PHP: Hypertext Preprocessor), est un langage de scripts libre principalement utilis\xE9 pour produire des pages Web dynamiques via un serveur HTTP, mais pouvant \xE9galement fonctionner comme n'importe quel langage interpr\xE9t\xE9 de fa\xE7on locale, en ex\xE9cutant les programmes en ligne de commande. PHP est un langage imp\xE9ratif disposant depuis la version 5 de fonctionnalit\xE9s de mod\xE8le objet compl\xE8tes. En raison de la richesse de sa biblioth\xE8que, on d\xE9signe parfois PHP comme une plate-forme plus qu'un simple langage.`,
          link: "https://www.php.net"
        },
        {
          techno: "C-Sharp",
          description: `C# est un langage de programmation orient\xE9e objet, fortement typ\xE9, d\xE9riv\xE9 de C et de C++, ressemblant au langage Java. Il est utilis\xE9 pour d\xE9velopper des applications web, ainsi que des applications de bureau, des services web, des commandes, des widgets ou des biblioth\xE8ques de classes. En C#, une application est un lot de classes o\xF9 une des classes comporte une m\xE9thode Main, comme cela se fait en Java. `,
          link: "https://learn.microsoft.com/en-us/dotnet/csharp/"
        },
        {
          techno: "Golang",
          description: `Go est un langage de programmation compil\xE9 et concurrent inspir\xE9 de C et Pascal. S\u2019il vise aussi la rapidit\xE9 d\u2019ex\xE9cution, indispensable \xE0 la programmation syst\xE8me, il consid\xE8re le multithreading comme le moyen le plus robuste d\u2019assurer sur les processeurs actuels cette rapidit\xE9 tout en rendant la maintenance facile par s\xE9paration de t\xE2ches simples ex\xE9cut\xE9es ind\xE9pendamment afin d\u2019\xE9viter de cr\xE9er des \xAB usines \xE0 gaz \xBB.`,
          link: "https://go.dev/"
        },
        {
          techno: "Slim",
          description: ``,
          link: "https://www.slimframework.com/"
        },
        {
          techno: "Prestashop",
          description: ``,
          link: "https://www.prestashop.com/fr"
        },
        {
          techno: "Wordpress",
          description: ``,
          link: "https://wordpress.com/fr/"
        }
      ],
      Tools: [
        {
          techno: "Docker",
          description: ``,
          link: "https://www.docker.com/"
        },
        {
          techno: "Github",
          description: ``,
          link: "https://github.com/"
        },
        {
          techno: "Gitlab",
          description: ``,
          link: "https://about.gitlab.com/"
        },
        {
          techno: "Webpack",
          description: ``,
          link: "https://webpack.js.org/"
        },
        {
          techno: "Photoshop",
          description: ``,
          link: "https://www.adobe.com/be_fr/products/photoshop.html"
        },
        {
          techno: "InDesign",
          description: ``,
          link: "https://www.adobe.com/be_fr/products/indesign.html"
        },
        {
          techno: "Illustrator",
          description: ``,
          link: "https://www.adobe.com/be_fr/products/illustrator.html"
        },
        {
          techno: "Blender",
          description: ``,
          link: "https://www.blender.org/"
        }
      ],
      Database: [
        {
          techno: "SQL",
          description: ``,
          link: "https://sql.sh/"
        },
        {
          techno: "RethinkDB",
          description: ``,
          link: "https://rethinkdb.com/"
        },
        {
          techno: "Hasura",
          description: ``,
          link: "https://hasura.io/"
        },
        {
          techno: "ArangoDB",
          description: ``,
          link: "https://www.arangodb.com/"
        },
        {
          techno: "MongoDB",
          description: ``,
          link: "https://www.mongodb.com/"
        },
        {
          techno: "SurrealDB",
          description: ``,
          link: "https://surrealdb.com/"
        }
      ]
    }
  });
  return /* @__PURE__ */ jsx(Speak, {
    assets: [
      "app"
    ],
    children: [
      /* @__PURE__ */ jsx("div", {
        class: {
          "mobile-btn": true,
          open: state.menuActive
        },
        children: [
          /* @__PURE__ */ jsx("div", {
            onClick$: inlinedQrl(() => {
              const [state2] = useLexicalScope();
              return state2.menuActive = !state2.menuActive;
            }, "s_uWYnMcm8YUA", [
              state
            ]),
            class: {
              "mobile-btn-click": true
            },
            children: /* @__PURE__ */ jsx("div", {
              class: {
                "mobile-btn-burger": true
              }
            })
          }),
          /* @__PURE__ */ jsx("div", {
            class: {
              "mobile-menu": true
            },
            children: [
              /* @__PURE__ */ jsx("div", {
                class: {
                  "w-1/4": true
                },
                children: /* @__PURE__ */ jsx(LogoAlt, {
                  class: ""
                })
              }),
              /* @__PURE__ */ jsx("div", {
                onClick$: inlinedQrl(() => {
                  const [state2] = useLexicalScope();
                  state2.currentPage = "experience";
                  state2.menuActive = !state2.menuActive;
                }, "s_Vfz0HJPfQ2A", [
                  state
                ]),
                children: $lang(`en-EN`) && `experiences` || $lang(`it-IT`) && `esperienze` || $lang(`nl-NL`) && `ervaringen` || $lang(`sp-SP`) && `experiencias` || `exp\xE9riences`
              }),
              /* @__PURE__ */ jsx("div", {
                onClick$: inlinedQrl(() => {
                  const [state2] = useLexicalScope();
                  state2.currentPage = "skills";
                  state2.menuActive = !state2.menuActive;
                }, "s_wzBaSJX01eI", [
                  state
                ]),
                children: $lang(`en-EN`) && `skills` || $lang(`it-IT`) && `competenze` || $lang(`nl-NL`) && `vaardigheden` || $lang(`sp-SP`) && `habilidades` || `comp\xE9tences`
              })
            ]
          })
        ]
      }),
      /* @__PURE__ */ jsx("nav", {
        class: {
          navbar: true,
          "navbar-exp": state.currentPage === "experience",
          "navbar-skills": state.currentPage === "skills",
          "sm:hidden": true
        },
        children: [
          /* @__PURE__ */ jsx("div", {
            class: {
              "navbar-items": true
            },
            onClick$: inlinedQrl(() => {
              const [state2] = useLexicalScope();
              state2.currentPage = "skills";
            }, "s_04Gb0onajK8", [
              state
            ]),
            children: $lang(`en-EN`) && `skills` || $lang(`it-IT`) && `competenze` || $lang(`nl-NL`) && `vaardigheden` || $lang(`sp-SP`) && `habilidades` || `comp\xE9tences`
          }),
          /* @__PURE__ */ jsx("div", {
            class: {
              "navbar-items": true
            },
            onClick$: inlinedQrl(() => {
              const [state2] = useLexicalScope();
              state2.currentPage = "experience";
            }, "s_204TbHXWOvo", [
              state
            ]),
            children: $lang(`en-EN`) && `experiences` || $lang(`it-IT`) && `esperienze` || $lang(`nl-NL`) && `ervaringen` || $lang(`sp-SP`) && `experiencias` || `exp\xE9riences`
          })
        ]
      }),
      /* @__PURE__ */ jsx("section", {
        class: {
          home: true
        },
        children: [
          /* @__PURE__ */ jsx("div", {
            class: {
              me: true
            },
            children: /* @__PURE__ */ jsx("div", {
              class: {
                "me-img": true,
                "me-img-exp": state.currentPage === "experience",
                "me-img-skills": state.currentPage === "skills"
              }
            })
          }),
          /* @__PURE__ */ jsx("section", {
            class: {
              "home-info": true,
              "anim-info-disappear": state.currentPage !== "home"
            },
            children: [
              /* @__PURE__ */ jsx(Logo, {
                class: {
                  "home-info-logo": true
                }
              }),
              /* @__PURE__ */ jsx("span", {
                class: {
                  "home-info-name": true
                },
                children: "Alexandre Bove"
              }),
              /* @__PURE__ */ jsx("span", {
                class: {
                  "home-info-post": true
                },
                children: $lang(`en-EN`) && `Full Stack Developer` || $lang(`it-IT`) && `Sviluppatore Full Stack` || $lang(`nl-NL`) && `Fullstack ontwikkelaar` || $lang(`sp-SP`) && `Desarrollador Full Stack` || `Full Stack D\xE9veloppeur`
              }),
              /* @__PURE__ */ jsx("span", {
                class: {
                  "home-info-location": true
                },
                children: $lang(`en-EN`) && `Liege, Belgium` || $lang(`it-IT`) && `Liegi, Belgio` || $lang(`nl-NL`) && `Luik, Belgie` || $lang(`sp-SP`) && `Lieja, Belgica` || `Li\xE8ge, Belgique`
              }),
              /* @__PURE__ */ jsx("div", {
                class: {
                  "home-info-social": true
                },
                children: [
                  /* @__PURE__ */ jsx("a", {
                    href: "https://www.linkedin.com/in/alexandre-bove/",
                    children: /* @__PURE__ */ jsx("i", {
                      class: "fa-brands fa-linkedin"
                    })
                  }),
                  /* @__PURE__ */ jsx("a", {
                    href: "https://github.com/bovealexandre",
                    children: /* @__PURE__ */ jsx("i", {
                      class: "fa-brands fa-github"
                    })
                  }),
                  /* @__PURE__ */ jsx("a", {
                    href: "mailto:alexandre.l.bove@gmail.com?subject=Nous recherchons un d\xE9veloppeur !",
                    children: /* @__PURE__ */ jsx("i", {
                      class: "fa-solid fa-envelope"
                    })
                  })
                ]
              }),
              /* @__PURE__ */ jsx(ChangeLocale, {})
            ]
          })
        ]
      }),
      /* @__PURE__ */ jsx("section", {
        class: {
          neumorphism: true,
          hidden: state.currentPage !== "experience",
          appearing: true
        },
        children: [
          /* @__PURE__ */ jsx("i", {
            class: "fa-regular fa-circle-xmark float-right cursor-pointer",
            onClick$: inlinedQrl(() => {
              const [state2] = useLexicalScope();
              state2.currentPage = "home";
            }, "s_SQyJVtrX8H0", [
              state
            ])
          }),
          /* @__PURE__ */ jsx("h1", {
            class: {
              "pb-2": true,
              "w-3/4": true,
              "text-xl": true,
              "font-medium": true,
              capitalize: true
            },
            children: $lang(`en-EN`) && `experiences` || $lang(`it-IT`) && `esperienze` || $lang(`nl-NL`) && `ervaringen` || $lang(`sp-SP`) && `experiencias` || `exp\xE9riences`
          }),
          /* @__PURE__ */ jsx("div", {
            class: {
              "exp-container": true
            },
            children: state.experience.map((exp) => {
              return /* @__PURE__ */ jsx(Fragment, {
                children: /* @__PURE__ */ jsx("div", {
                  class: {
                    exp: true
                  },
                  children: [
                    /* @__PURE__ */ jsx("div", {
                      class: {
                        "exp-img-container": true
                      },
                      children: /* @__PURE__ */ jsx("img", {
                        class: {
                          "exp-img": true
                        },
                        src: exp.img
                      })
                    }),
                    /* @__PURE__ */ jsx("div", {
                      class: {
                        "exp-info": true
                      },
                      children: [
                        /* @__PURE__ */ jsx("h2", {
                          children: exp.entreprise
                        }),
                        /* @__PURE__ */ jsx("div", {
                          class: {
                            "text-sm": true,
                            capitalize: true
                          },
                          children: exp.time.start.toLocaleDateString(loc.lang, {
                            year: "numeric",
                            month: "long"
                          }) + " - " + exp.time.end.toLocaleDateString(loc.lang, {
                            year: "numeric",
                            month: "long"
                          })
                        }),
                        /* @__PURE__ */ jsx("div", {
                          children: [
                            exp.job ? /* @__PURE__ */ jsx("i", {
                              class: "fa-solid fa-briefcase"
                            }) : /* @__PURE__ */ jsx("i", {
                              class: "fa-solid fa-graduation-cap"
                            }),
                            " ",
                            exp.poste
                          ]
                        }),
                        exp.technos.length != 0 ? /* @__PURE__ */ jsx("div", {
                          class: {
                            "exp-info-technos": true
                          },
                          children: exp.technos.map((techno) => /* @__PURE__ */ jsx("div", {
                            class: {
                              "exp-info-techno": true
                            },
                            children: techno
                          }))
                        }) : "",
                        /* @__PURE__ */ jsx("p", {
                          class: {
                            "exp-info-description": true
                          },
                          children: exp.description[loc.lang]
                        })
                      ]
                    })
                  ]
                })
              });
            })
          })
        ]
      }),
      /* @__PURE__ */ jsx("section", {
        class: {
          neumorphism: true,
          hidden: state.currentPage !== "skills",
          appearing: true
        },
        children: [
          /* @__PURE__ */ jsx("i", {
            class: "fa-regular fa-circle-xmark float-right cursor-pointer",
            onClick$: inlinedQrl(() => {
              const [state2] = useLexicalScope();
              state2.currentPage = "home";
            }, "s_Y100P8CFH8E", [
              state
            ])
          }),
          /* @__PURE__ */ jsx("h1", {
            class: {
              "pb-2": true,
              "w-3/4": true,
              "text-xl": true,
              "font-medium": true,
              capitalize: true
            },
            children: $lang(`en-EN`) && `skills` || $lang(`it-IT`) && `competenze` || $lang(`nl-NL`) && `vaardigheden` || $lang(`sp-SP`) && `habilidades` || `comp\xE9tences`
          }),
          /* @__PURE__ */ jsx("div", {
            class: {
              "skills-container": true
            },
            children: /* @__PURE__ */ jsx("div", {
              class: {
                relative: true
              },
              children: Object.keys(state.skills).map((skillCat, index2) => {
                return /* @__PURE__ */ jsx(Fragment, {
                  children: [
                    /* @__PURE__ */ jsx("div", {
                      class: {
                        "skills-title": true
                      },
                      children: skillCat
                    }, index2),
                    /* @__PURE__ */ jsx("div", {
                      class: {
                        "skills-grid": true
                      },
                      children: state.skills[skillCat].map((skill) => /* @__PURE__ */ jsx("div", {
                        class: {
                          "h-auto": state.currentSkill !== skill.techno,
                          "h-28": state.currentSkill === skill.techno,
                          "transition-all": true,
                          "duration-500": true,
                          "ease-in-out": true
                        },
                        children: [
                          /* @__PURE__ */ jsx("div", {
                            class: {
                              "skills-skill": true
                            },
                            onClick$: inlinedQrl(() => {
                              const [skill2, state2] = useLexicalScope();
                              return state2.currentSkill = state2.currentSkill !== skill2.techno ? skill2.techno : "none";
                            }, "s_mLGQcH9DZ50", [
                              skill,
                              state
                            ]),
                            children: /* @__PURE__ */ jsx("img", {
                              src: "skills/" + skill.techno + ".webp",
                              alt: skill.techno
                            })
                          }),
                          /* @__PURE__ */ jsx("div", {
                            class: {
                              "skills-desc": true,
                              hidden: state.currentSkill !== skill.techno
                            },
                            children: /* @__PURE__ */ jsx("a", {
                              href: skill.link,
                              target: "_blank",
                              children: /* @__PURE__ */ jsx("h3", {
                                class: {
                                  "skills-link": true
                                },
                                children: skill.techno === "C-Sharp" ? "C#" : skill.techno
                              })
                            })
                          })
                        ]
                      }))
                    })
                  ]
                });
              })
            })
          })
        ]
      })
    ]
  });
}, "s_jpH0I2vriFs"));
const head = {
  title: "Alexandre Bove - Full stack Developer"
};
const Q1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: index,
  head
}, Symbol.toStringTag, { value: "Module" }));
const Q1Layout = () => Q1Layout_;
const routes = [
  [/^(?:\/(.*))?\/?$/, [Q1Layout, () => Q1], ["lang"], "/[...lang]", ["q-5089877a.js", "q-5967cf32.js"]]
];
const menus = [];
const trailingSlash = false;
const basePathname = "/";
const cacheModules = true;
const _qwikCityPlan = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  routes,
  menus,
  trailingSlash,
  basePathname,
  cacheModules
}, Symbol.toStringTag, { value: "Module" }));
var HEADERS = Symbol("headers");
var _a;
var HeadersPolyfill = class {
  constructor() {
    this[_a] = {};
  }
  [(_a = HEADERS, Symbol.iterator)]() {
    return this.entries();
  }
  *keys() {
    for (const name of Object.keys(this[HEADERS])) {
      yield name;
    }
  }
  *values() {
    for (const value of Object.values(this[HEADERS])) {
      yield value;
    }
  }
  *entries() {
    for (const name of Object.keys(this[HEADERS])) {
      yield [name, this.get(name)];
    }
  }
  get(name) {
    return this[HEADERS][normalizeHeaderName(name)] || null;
  }
  set(name, value) {
    const normalizedName = normalizeHeaderName(name);
    this[HEADERS][normalizedName] = typeof value !== "string" ? String(value) : value;
  }
  append(name, value) {
    const normalizedName = normalizeHeaderName(name);
    const resolvedValue = this.has(normalizedName) ? `${this.get(normalizedName)}, ${value}` : value;
    this.set(name, resolvedValue);
  }
  delete(name) {
    if (!this.has(name)) {
      return;
    }
    const normalizedName = normalizeHeaderName(name);
    delete this[HEADERS][normalizedName];
  }
  all() {
    return this[HEADERS];
  }
  has(name) {
    return this[HEADERS].hasOwnProperty(normalizeHeaderName(name));
  }
  forEach(callback, thisArg) {
    for (const name in this[HEADERS]) {
      if (this[HEADERS].hasOwnProperty(name)) {
        callback.call(thisArg, this[HEADERS][name], name, this);
      }
    }
  }
};
var HEADERS_INVALID_CHARACTERS = /[^a-z0-9\-#$%&'*+.^_`|~]/i;
function normalizeHeaderName(name) {
  if (typeof name !== "string") {
    name = String(name);
  }
  if (HEADERS_INVALID_CHARACTERS.test(name) || name.trim() === "") {
    throw new TypeError("Invalid character in header field name");
  }
  return name.toLowerCase();
}
function createHeaders() {
  return new (typeof Headers === "function" ? Headers : HeadersPolyfill)();
}
var ErrorResponse = class extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
};
function notFoundHandler(requestCtx) {
  return errorResponse(requestCtx, new ErrorResponse(404, "Not Found"));
}
function errorHandler(requestCtx, e) {
  const status = 500;
  let message = "Server Error";
  let stack = void 0;
  if (e != null) {
    if (typeof e === "object") {
      if (typeof e.message === "string") {
        message = e.message;
      }
      if (e.stack != null) {
        stack = String(e.stack);
      }
    } else {
      message = String(e);
    }
  }
  const html = minimalHtmlResponse(status, message, stack);
  const headers = createHeaders();
  headers.set("Content-Type", "text/html; charset=utf-8");
  return requestCtx.response(
    status,
    headers,
    async (stream) => {
      stream.write(html);
    },
    e
  );
}
function errorResponse(requestCtx, errorResponse2) {
  const html = minimalHtmlResponse(
    errorResponse2.status,
    errorResponse2.message,
    errorResponse2.stack
  );
  const headers = createHeaders();
  headers.set("Content-Type", "text/html; charset=utf-8");
  return requestCtx.response(
    errorResponse2.status,
    headers,
    async (stream) => {
      stream.write(html);
    },
    errorResponse2
  );
}
function minimalHtmlResponse(status, message, stack) {
  const width = typeof message === "string" ? "600px" : "300px";
  const color = status >= 500 ? COLOR_500 : COLOR_400;
  if (status < 500) {
    stack = "";
  }
  return `<!DOCTYPE html>
<html data-qwik-city-status="${status}">
<head>
  <meta charset="utf-8">
  <title>${status} ${message}</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body { color: ${color}; background-color: #fafafa; padding: 30px; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Roboto, sans-serif; }
    p { max-width: ${width}; margin: 60px auto 30px auto; background: white; border-radius: 4px; box-shadow: 0px 0px 50px -20px ${color}; overflow: hidden; }
    strong { display: inline-block; padding: 15px; background: ${color}; color: white; }
    span { display: inline-block; padding: 15px; }
    pre { max-width: 580px; margin: 0 auto; }
  </style>
</head>
<body>
  <p>
    <strong>${status}</strong>
    <span>${message}</span>
  </p>
  ${stack ? `<pre><code>${stack}</code></pre>` : ``}
</body>
</html>
`;
}
var COLOR_400 = "#006ce9";
var COLOR_500 = "#713fc2";
var MODULE_CACHE = /* @__PURE__ */ new WeakMap();
var loadRoute = async (routes2, menus2, cacheModules2, pathname) => {
  if (Array.isArray(routes2)) {
    for (const route of routes2) {
      const match = route[0].exec(pathname);
      if (match) {
        const loaders = route[1];
        const params = getRouteParams(route[2], match);
        const routeBundleNames = route[4];
        const mods = new Array(loaders.length);
        const pendingLoads = [];
        const menuLoader = getMenuLoader(menus2, pathname);
        let menu = void 0;
        loaders.forEach((moduleLoader, i) => {
          loadModule(
            moduleLoader,
            pendingLoads,
            (routeModule) => mods[i] = routeModule,
            cacheModules2
          );
        });
        loadModule(
          menuLoader,
          pendingLoads,
          (menuModule) => menu = menuModule == null ? void 0 : menuModule.default,
          cacheModules2
        );
        if (pendingLoads.length > 0) {
          await Promise.all(pendingLoads);
        }
        return [params, mods, menu, routeBundleNames];
      }
    }
  }
  return null;
};
var loadModule = (moduleLoader, pendingLoads, moduleSetter, cacheModules2) => {
  if (typeof moduleLoader === "function") {
    const loadedModule = MODULE_CACHE.get(moduleLoader);
    if (loadedModule) {
      moduleSetter(loadedModule);
    } else {
      const l = moduleLoader();
      if (typeof l.then === "function") {
        pendingLoads.push(
          l.then((loadedModule2) => {
            if (cacheModules2 !== false) {
              MODULE_CACHE.set(moduleLoader, loadedModule2);
            }
            moduleSetter(loadedModule2);
          })
        );
      } else if (l) {
        moduleSetter(l);
      }
    }
  }
};
var getMenuLoader = (menus2, pathname) => {
  if (menus2) {
    const menu = menus2.find(
      (m) => m[0] === pathname || pathname.startsWith(m[0] + (pathname.endsWith("/") ? "" : "/"))
    );
    if (menu) {
      return menu[1];
    }
  }
  return void 0;
};
var getRouteParams = (paramNames, match) => {
  const params = {};
  if (paramNames) {
    for (let i = 0; i < paramNames.length; i++) {
      params[paramNames[i]] = match ? match[i + 1] : "";
    }
  }
  return params;
};
var RedirectResponse = class {
  constructor(url, status, headers) {
    this.url = url;
    this.location = url;
    this.status = isRedirectStatus(status) ? status : 307;
    this.headers = headers || createHeaders();
    this.headers.set("Location", this.location);
    this.headers.delete("Cache-Control");
  }
};
function redirectResponse(requestCtx, responseRedirect) {
  return requestCtx.response(responseRedirect.status, responseRedirect.headers, async () => {
  });
}
function isRedirectStatus(status) {
  return typeof status === "number" && status >= 301 && status <= 308;
}
async function loadUserResponse(requestCtx, params, routeModules, platform, trailingSlash2, basePathname2 = "/") {
  if (routeModules.length === 0) {
    throw new ErrorResponse(404, `Not Found`);
  }
  const { request, url } = requestCtx;
  const { pathname } = url;
  const isPageModule = isLastModulePageRoute(routeModules);
  const isPageDataRequest = isPageModule && request.headers.get("Accept") === "application/json";
  const type = isPageDataRequest ? "pagedata" : isPageModule ? "pagehtml" : "endpoint";
  const userResponse = {
    type,
    url,
    params,
    status: 200,
    headers: createHeaders(),
    resolvedBody: void 0,
    pendingBody: void 0,
    aborted: false
  };
  let hasRequestMethodHandler = false;
  if (isPageModule && pathname !== basePathname2) {
    if (trailingSlash2) {
      if (!pathname.endsWith("/")) {
        throw new RedirectResponse(pathname + "/" + url.search, 307);
      }
    } else {
      if (pathname.endsWith("/")) {
        throw new RedirectResponse(
          pathname.slice(0, pathname.length - 1) + url.search,
          307
        );
      }
    }
  }
  let routeModuleIndex = -1;
  const abort = () => {
    routeModuleIndex = ABORT_INDEX;
  };
  const redirect = (url2, status) => {
    return new RedirectResponse(url2, status, userResponse.headers);
  };
  const error = (status, message) => {
    return new ErrorResponse(status, message);
  };
  const next = async () => {
    routeModuleIndex++;
    while (routeModuleIndex < routeModules.length) {
      const endpointModule = routeModules[routeModuleIndex];
      let reqHandler = void 0;
      switch (request.method) {
        case "GET": {
          reqHandler = endpointModule.onGet;
          break;
        }
        case "POST": {
          reqHandler = endpointModule.onPost;
          break;
        }
        case "PUT": {
          reqHandler = endpointModule.onPut;
          break;
        }
        case "PATCH": {
          reqHandler = endpointModule.onPatch;
          break;
        }
        case "OPTIONS": {
          reqHandler = endpointModule.onOptions;
          break;
        }
        case "HEAD": {
          reqHandler = endpointModule.onHead;
          break;
        }
        case "DELETE": {
          reqHandler = endpointModule.onDelete;
          break;
        }
      }
      reqHandler = reqHandler || endpointModule.onRequest;
      if (typeof reqHandler === "function") {
        hasRequestMethodHandler = true;
        const response = {
          get status() {
            return userResponse.status;
          },
          set status(code) {
            userResponse.status = code;
          },
          get headers() {
            return userResponse.headers;
          },
          redirect,
          error
        };
        const requestEv = {
          request,
          url: new URL(url),
          params: { ...params },
          response,
          platform,
          next,
          abort
        };
        const syncData = reqHandler(requestEv);
        if (typeof syncData === "function") {
          userResponse.pendingBody = createPendingBody(syncData);
        } else if (syncData !== null && typeof syncData === "object" && typeof syncData.then === "function") {
          const asyncResolved = await syncData;
          if (typeof asyncResolved === "function") {
            userResponse.pendingBody = createPendingBody(asyncResolved);
          } else {
            userResponse.resolvedBody = asyncResolved;
          }
        } else {
          userResponse.resolvedBody = syncData;
        }
      }
      routeModuleIndex++;
    }
  };
  await next();
  userResponse.aborted = routeModuleIndex >= ABORT_INDEX;
  if (!isPageDataRequest && isRedirectStatus(userResponse.status) && userResponse.headers.has("Location")) {
    throw new RedirectResponse(
      userResponse.headers.get("Location"),
      userResponse.status,
      userResponse.headers
    );
  }
  if (type === "endpoint" && !hasRequestMethodHandler) {
    throw new ErrorResponse(405, `Method Not Allowed`);
  }
  return userResponse;
}
function createPendingBody(cb) {
  return new Promise((resolve, reject) => {
    try {
      const rtn = cb();
      if (rtn !== null && typeof rtn === "object" && typeof rtn.then === "function") {
        rtn.then(resolve, reject);
      } else {
        resolve(rtn);
      }
    } catch (e) {
      reject(e);
    }
  });
}
function isLastModulePageRoute(routeModules) {
  const lastRouteModule = routeModules[routeModules.length - 1];
  return lastRouteModule && typeof lastRouteModule.default === "function";
}
function updateRequestCtx(requestCtx, trailingSlash2) {
  let pathname = requestCtx.url.pathname;
  if (pathname.endsWith(QDATA_JSON)) {
    requestCtx.request.headers.set("Accept", "application/json");
    const trimEnd = pathname.length - QDATA_JSON_LEN + (trailingSlash2 ? 1 : 0);
    pathname = pathname.slice(0, trimEnd);
    if (pathname === "") {
      pathname = "/";
    }
    requestCtx.url.pathname = pathname;
  }
}
var QDATA_JSON = "/q-data.json";
var QDATA_JSON_LEN = QDATA_JSON.length;
var ABORT_INDEX = 999999999;
function endpointHandler(requestCtx, userResponse) {
  const { pendingBody, resolvedBody, status, headers } = userResponse;
  const { response } = requestCtx;
  if (pendingBody === void 0 && resolvedBody === void 0) {
    return response(status, headers, asyncNoop);
  }
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json; charset=utf-8");
  }
  const isJson = headers.get("Content-Type").includes("json");
  return response(status, headers, async ({ write }) => {
    const body = pendingBody !== void 0 ? await pendingBody : resolvedBody;
    if (body !== void 0) {
      if (isJson) {
        write(JSON.stringify(body));
      } else {
        const type = typeof body;
        if (type === "string") {
          write(body);
        } else if (type === "number" || type === "boolean") {
          write(String(body));
        } else {
          write(body);
        }
      }
    }
  });
}
var asyncNoop = async () => {
};
function pageHandler(requestCtx, userResponse, render2, opts, routeBundleNames) {
  const { status, headers } = userResponse;
  const { response } = requestCtx;
  const isPageData = userResponse.type === "pagedata";
  if (isPageData) {
    headers.set("Content-Type", "application/json; charset=utf-8");
  } else if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "text/html; charset=utf-8");
  }
  return response(isPageData ? 200 : status, headers, async (stream) => {
    const result = await render2({
      stream: isPageData ? noopStream : stream,
      envData: getQwikCityEnvData(userResponse),
      ...opts
    });
    if (isPageData) {
      stream.write(JSON.stringify(await getClientPageData(userResponse, result, routeBundleNames)));
    } else {
      if ((typeof result).html === "string") {
        stream.write(result.html);
      }
    }
    if (typeof stream.clientData === "function") {
      stream.clientData(await getClientPageData(userResponse, result, routeBundleNames));
    }
  });
}
async function getClientPageData(userResponse, result, routeBundleNames) {
  const prefetchBundleNames = getPrefetchBundleNames(result, routeBundleNames);
  const clientPage = {
    body: userResponse.pendingBody ? await userResponse.pendingBody : userResponse.resolvedBody,
    status: userResponse.status !== 200 ? userResponse.status : void 0,
    redirect: userResponse.status >= 301 && userResponse.status <= 308 && userResponse.headers.get("location") || void 0,
    prefetch: prefetchBundleNames.length > 0 ? prefetchBundleNames : void 0
  };
  return clientPage;
}
function getPrefetchBundleNames(result, routeBundleNames) {
  const bundleNames = [];
  const addBundle2 = (bundleName) => {
    if (bundleName && !bundleNames.includes(bundleName)) {
      bundleNames.push(bundleName);
    }
  };
  const addPrefetchResource = (prefetchResources) => {
    if (Array.isArray(prefetchResources)) {
      for (const prefetchResource of prefetchResources) {
        const bundleName = prefetchResource.url.split("/").pop();
        if (bundleName && !bundleNames.includes(bundleName)) {
          addBundle2(bundleName);
          addPrefetchResource(prefetchResource.imports);
        }
      }
    }
  };
  addPrefetchResource(result.prefetchResources);
  const manifest2 = result.manifest || result._manifest;
  const renderedSymbols = result._symbols;
  if (manifest2 && renderedSymbols) {
    for (const renderedSymbolName of renderedSymbols) {
      const symbol = manifest2.symbols[renderedSymbolName];
      if (symbol && symbol.ctxName === "component$") {
        addBundle2(manifest2.mapping[renderedSymbolName]);
      }
    }
  }
  if (routeBundleNames) {
    for (const routeBundleName of routeBundleNames) {
      addBundle2(routeBundleName);
    }
  }
  return bundleNames;
}
function getQwikCityEnvData(userResponse) {
  const { url, params, pendingBody, resolvedBody, status } = userResponse;
  return {
    url: url.href,
    qwikcity: {
      params: { ...params },
      response: {
        body: pendingBody || resolvedBody,
        status
      }
    }
  };
}
var noopStream = { write: () => {
} };
async function requestHandler(requestCtx, render2, platform, opts) {
  try {
    updateRequestCtx(requestCtx, trailingSlash);
    const loadedRoute = await loadRoute(routes, menus, cacheModules, requestCtx.url.pathname);
    if (loadedRoute) {
      const [params, mods, _, routeBundleNames] = loadedRoute;
      const userResponse = await loadUserResponse(
        requestCtx,
        params,
        mods,
        platform,
        trailingSlash,
        basePathname
      );
      if (userResponse.aborted) {
        return null;
      }
      if (userResponse.type === "endpoint") {
        return endpointHandler(requestCtx, userResponse);
      }
      return pageHandler(requestCtx, userResponse, render2, opts, routeBundleNames);
    }
  } catch (e) {
    if (e instanceof RedirectResponse) {
      return redirectResponse(requestCtx, e);
    }
    if (e instanceof ErrorResponse) {
      return errorResponse(requestCtx, e);
    }
    return errorHandler(requestCtx, e);
  }
  return null;
}
function qwikCity(render2, opts) {
  async function onRequest2(request, { next }) {
    try {
      const requestCtx = {
        url: new URL(request.url),
        request,
        response: (status, headers, body) => {
          return new Promise((resolve) => {
            let flushedHeaders = false;
            const { readable, writable } = new TransformStream();
            const writer = writable.getWriter();
            const response = new Response(readable, { status, headers });
            body({
              write: (chunk) => {
                if (!flushedHeaders) {
                  flushedHeaders = true;
                  resolve(response);
                }
                if (typeof chunk === "string") {
                  const encoder = new TextEncoder();
                  writer.write(encoder.encode(chunk));
                } else {
                  writer.write(chunk);
                }
              }
            }).finally(() => {
              if (!flushedHeaders) {
                flushedHeaders = true;
                resolve(response);
              }
              writer.close();
            });
          });
        }
      };
      const handledResponse = await requestHandler(requestCtx, render2, {}, opts);
      if (handledResponse) {
        return handledResponse;
      }
      const nextResponse = await next();
      if (nextResponse.status === 404) {
        const handledResponse2 = await requestHandler(requestCtx, render2, {}, opts);
        if (handledResponse2) {
          return handledResponse2;
        }
        const notFoundResponse = await notFoundHandler(requestCtx);
        return notFoundResponse;
      }
      return nextResponse;
    } catch (e) {
      return new Response(String(e || "Error"), {
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }
  }
  return onRequest2;
}
/**
 * @license
 * @builder.io/qwik/server 0.9.0
 * Copyright Builder.io, Inc. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/BuilderIO/qwik/blob/main/LICENSE
 */
if (typeof global == "undefined") {
  const g = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof self ? self : {};
  g.global = g;
}
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a2, b) => (typeof require !== "undefined" ? require : a2)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw new Error('Dynamic require of "' + x + '" is not supported');
});
function createTimer() {
  if (typeof performance === "undefined") {
    return () => 0;
  }
  const start = performance.now();
  return () => {
    const end = performance.now();
    const delta = end - start;
    return delta / 1e6;
  };
}
function getBuildBase(opts) {
  let base = opts.base;
  if (typeof base === "string") {
    if (!base.endsWith("/")) {
      base += "/";
    }
    return base;
  }
  return "/build/";
}
function createPlatform(opts, resolvedManifest) {
  const mapper = resolvedManifest == null ? void 0 : resolvedManifest.mapper;
  const mapperFn = opts.symbolMapper ? opts.symbolMapper : (symbolName) => {
    if (mapper) {
      const hash = getSymbolHash(symbolName);
      const result = mapper[hash];
      if (!result) {
        console.error("Cannot resolve symbol", symbolName, "in", mapper);
      }
      return result;
    }
  };
  const serverPlatform = {
    isServer: true,
    async importSymbol(_element, qrl, symbolName) {
      let [modulePath] = String(qrl).split("#");
      if (!modulePath.endsWith(".js")) {
        modulePath += ".js";
      }
      const module = __require(modulePath);
      if (!(symbolName in module)) {
        throw new Error(`Q-ERROR: missing symbol '${symbolName}' in module '${modulePath}'.`);
      }
      const symbol = module[symbolName];
      return symbol;
    },
    raf: () => {
      console.error("server can not rerender");
      return Promise.resolve();
    },
    nextTick: (fn) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(fn());
        });
      });
    },
    chunkForSymbol(symbolName) {
      return mapperFn(symbolName, mapper);
    }
  };
  return serverPlatform;
}
async function setServerPlatform(opts, manifest2) {
  const platform = createPlatform(opts, manifest2);
  setPlatform(platform);
}
var getSymbolHash = (symbolName) => {
  const index2 = symbolName.lastIndexOf("_");
  if (index2 > -1) {
    return symbolName.slice(index2 + 1);
  }
  return symbolName;
};
var QWIK_LOADER_DEFAULT_MINIFIED = '(()=>{function e(e){return"object"==typeof e&&e&&"Module"===e[Symbol.toStringTag]}((t,n)=>{const o="__q_context__",r=window,a=(e,n,o)=>{n=n.replace(/([A-Z])/g,(e=>"-"+e.toLowerCase())),t.querySelectorAll("[on"+e+"\\\\:"+n+"]").forEach((t=>l(t,e,n,o)))},i=(e,t)=>new CustomEvent(e,{detail:t}),s=e=>{throw Error("QWIK "+e)},c=(e,n)=>(e=e.closest("[q\\\\:container]"),new URL(n,new URL(e?e.getAttribute("q:base"):t.baseURI,t.baseURI))),l=async(n,a,l,d)=>{var u;n.hasAttribute("preventdefault:"+l)&&d.preventDefault();const b="on"+a+":"+l,v=null==(u=n._qc_)?void 0:u.li[b];if(v){for(const e of v)await e.getFn([n,d],(()=>n.isConnected))(d,n);return}const p=n.getAttribute(b);if(p)for(const a of p.split("\\n")){const l=c(n,a);if(l){const a=f(l),c=(r[l.pathname]||(w=await import(l.href.split("#")[0]),Object.values(w).find(e)||w))[a]||s(l+" does not export "+a),u=t[o];if(n.isConnected)try{t[o]=[n,d,l],await c(d,n)}finally{t[o]=u,t.dispatchEvent(i("qsymbol",{symbol:a,element:n}))}}}var w},f=e=>e.hash.replace(/^#?([^?[|]*).*$/,"$1")||"default",d=async e=>{let t=e.target;for(a("-document",e.type,e);t&&t.getAttribute;)await l(t,"",e.type,e),t=e.bubbles&&!0!==e.cancelBubble?t.parentElement:null},u=e=>{a("-window",e.type,e)},b=()=>{const e=t.readyState;if(!n&&("interactive"==e||"complete"==e)){n=1,a("","qinit",i("qinit"));const e=t.querySelectorAll("[on\\\\:qvisible]");if(e.length>0){const t=new IntersectionObserver((e=>{for(const n of e)n.isIntersecting&&(t.unobserve(n.target),l(n.target,"","qvisible",i("qvisible",n)))}));e.forEach((e=>t.observe(e)))}}},v=new Set,p=e=>{for(const t of e)v.has(t)||(document.addEventListener(t,d,{capture:!0}),r.addEventListener(t,u),v.add(t))};if(!t.qR){const e=r.qwikevents;Array.isArray(e)&&p(e),r.qwikevents={push:(...e)=>p(e)},t.addEventListener("readystatechange",b),b()}})(document)})();';
var QWIK_LOADER_DEFAULT_DEBUG = '(() => {\n    function findModule(module) {\n        return Object.values(module).find(isModule) || module;\n    }\n    function isModule(module) {\n        return "object" == typeof module && module && "Module" === module[Symbol.toStringTag];\n    }\n    ((doc, hasInitialized) => {\n        const win = window;\n        const broadcast = (infix, type, ev) => {\n            type = type.replace(/([A-Z])/g, (a => "-" + a.toLowerCase()));\n            doc.querySelectorAll("[on" + infix + "\\\\:" + type + "]").forEach((target => dispatch(target, infix, type, ev)));\n        };\n        const createEvent = (eventName, detail) => new CustomEvent(eventName, {\n            detail: detail\n        });\n        const error = msg => {\n            throw new Error("QWIK " + msg);\n        };\n        const qrlResolver = (element, qrl) => {\n            element = element.closest("[q\\\\:container]");\n            return new URL(qrl, new URL(element ? element.getAttribute("q:base") : doc.baseURI, doc.baseURI));\n        };\n        const dispatch = async (element, onPrefix, eventName, ev) => {\n            var _a;\n            element.hasAttribute("preventdefault:" + eventName) && ev.preventDefault();\n            const attrName = "on" + onPrefix + ":" + eventName;\n            const qrls = null == (_a = element._qc_) ? void 0 : _a.li[attrName];\n            if (qrls) {\n                for (const q of qrls) {\n                    await q.getFn([ element, ev ], (() => element.isConnected))(ev, element);\n                }\n                return;\n            }\n            const attrValue = element.getAttribute(attrName);\n            if (attrValue) {\n                for (const qrl of attrValue.split("\\n")) {\n                    const url = qrlResolver(element, qrl);\n                    if (url) {\n                        const symbolName = getSymbolName(url);\n                        const handler = (win[url.pathname] || findModule(await import(url.href.split("#")[0])))[symbolName] || error(url + " does not export " + symbolName);\n                        const previousCtx = doc.__q_context__;\n                        if (element.isConnected) {\n                            try {\n                                doc.__q_context__ = [ element, ev, url ];\n                                await handler(ev, element);\n                            } finally {\n                                doc.__q_context__ = previousCtx;\n                                doc.dispatchEvent(createEvent("qsymbol", {\n                                    symbol: symbolName,\n                                    element: element\n                                }));\n                            }\n                        }\n                    }\n                }\n            }\n        };\n        const getSymbolName = url => url.hash.replace(/^#?([^?[|]*).*$/, "$1") || "default";\n        const processDocumentEvent = async ev => {\n            let element = ev.target;\n            broadcast("-document", ev.type, ev);\n            while (element && element.getAttribute) {\n                await dispatch(element, "", ev.type, ev);\n                element = ev.bubbles && !0 !== ev.cancelBubble ? element.parentElement : null;\n            }\n        };\n        const processWindowEvent = ev => {\n            broadcast("-window", ev.type, ev);\n        };\n        const processReadyStateChange = () => {\n            const readyState = doc.readyState;\n            if (!hasInitialized && ("interactive" == readyState || "complete" == readyState)) {\n                hasInitialized = 1;\n                broadcast("", "qinit", createEvent("qinit"));\n                const results = doc.querySelectorAll("[on\\\\:qvisible]");\n                if (results.length > 0) {\n                    const observer = new IntersectionObserver((entries => {\n                        for (const entry of entries) {\n                            if (entry.isIntersecting) {\n                                observer.unobserve(entry.target);\n                                dispatch(entry.target, "", "qvisible", createEvent("qvisible", entry));\n                            }\n                        }\n                    }));\n                    results.forEach((el => observer.observe(el)));\n                }\n            }\n        };\n        const events =  new Set;\n        const push = eventNames => {\n            for (const eventName of eventNames) {\n                if (!events.has(eventName)) {\n                    document.addEventListener(eventName, processDocumentEvent, {\n                        capture: !0\n                    });\n                    win.addEventListener(eventName, processWindowEvent);\n                    events.add(eventName);\n                }\n            }\n        };\n        if (!doc.qR) {\n            const qwikevents = win.qwikevents;\n            Array.isArray(qwikevents) && push(qwikevents);\n            win.qwikevents = {\n                push: (...e) => push(e)\n            };\n            doc.addEventListener("readystatechange", processReadyStateChange);\n            processReadyStateChange();\n        }\n    })(document);\n})();';
var QWIK_LOADER_OPTIMIZE_MINIFIED = '(()=>{function e(e){return"object"==typeof e&&e&&"Module"===e[Symbol.toStringTag]}((t,n)=>{const o="__q_context__",r=window,a=(e,n,o)=>{n=n.replace(/([A-Z])/g,(e=>"-"+e.toLowerCase())),t.querySelectorAll("[on"+e+"\\\\:"+n+"]").forEach((t=>l(t,e,n,o)))},i=(e,t)=>new CustomEvent(e,{detail:t}),s=e=>{throw Error("QWIK "+e)},c=(e,n)=>(e=e.closest("[q\\\\:container]"),new URL(n,new URL(e?e.getAttribute("q:base"):t.baseURI,t.baseURI))),l=async(n,a,l,d)=>{var u;n.hasAttribute("preventdefault:"+l)&&d.preventDefault();const b="on"+a+":"+l,v=null==(u=n._qc_)?void 0:u.li[b];if(v){for(const e of v)await e.getFn([n,d],(()=>n.isConnected))(d,n);return}const p=n.getAttribute(b);if(p)for(const a of p.split("\\n")){const l=c(n,a);if(l){const a=f(l),c=(r[l.pathname]||(w=await import(l.href.split("#")[0]),Object.values(w).find(e)||w))[a]||s(l+" does not export "+a),u=t[o];if(n.isConnected)try{t[o]=[n,d,l],await c(d,n)}finally{t[o]=u,t.dispatchEvent(i("qsymbol",{symbol:a,element:n}))}}}var w},f=e=>e.hash.replace(/^#?([^?[|]*).*$/,"$1")||"default",d=async e=>{let t=e.target;for(a("-document",e.type,e);t&&t.getAttribute;)await l(t,"",e.type,e),t=e.bubbles&&!0!==e.cancelBubble?t.parentElement:null},u=e=>{a("-window",e.type,e)},b=()=>{const e=t.readyState;if(!n&&("interactive"==e||"complete"==e)){n=1,a("","qinit",i("qinit"));const e=t.querySelectorAll("[on\\\\:qvisible]");if(e.length>0){const t=new IntersectionObserver((e=>{for(const n of e)n.isIntersecting&&(t.unobserve(n.target),l(n.target,"","qvisible",i("qvisible",n)))}));e.forEach((e=>t.observe(e)))}}},v=new Set,p=e=>{for(const t of e)v.has(t)||(document.addEventListener(t,d,{capture:!0}),r.addEventListener(t,u),v.add(t))};if(!t.qR){const e=r.qwikevents;Array.isArray(e)&&p(e),r.qwikevents={push:(...e)=>p(e)},t.addEventListener("readystatechange",b),b()}})(document)})();';
var QWIK_LOADER_OPTIMIZE_DEBUG = '(() => {\n    function findModule(module) {\n        return Object.values(module).find(isModule) || module;\n    }\n    function isModule(module) {\n        return "object" == typeof module && module && "Module" === module[Symbol.toStringTag];\n    }\n    ((doc, hasInitialized) => {\n        const win = window;\n        const broadcast = (infix, type, ev) => {\n            type = type.replace(/([A-Z])/g, (a => "-" + a.toLowerCase()));\n            doc.querySelectorAll("[on" + infix + "\\\\:" + type + "]").forEach((target => dispatch(target, infix, type, ev)));\n        };\n        const createEvent = (eventName, detail) => new CustomEvent(eventName, {\n            detail: detail\n        });\n        const error = msg => {\n            throw new Error("QWIK " + msg);\n        };\n        const qrlResolver = (element, qrl) => {\n            element = element.closest("[q\\\\:container]");\n            return new URL(qrl, new URL(element ? element.getAttribute("q:base") : doc.baseURI, doc.baseURI));\n        };\n        const dispatch = async (element, onPrefix, eventName, ev) => {\n            var _a;\n            element.hasAttribute("preventdefault:" + eventName) && ev.preventDefault();\n            const attrName = "on" + onPrefix + ":" + eventName;\n            const qrls = null == (_a = element._qc_) ? void 0 : _a.li[attrName];\n            if (qrls) {\n                for (const q of qrls) {\n                    await q.getFn([ element, ev ], (() => element.isConnected))(ev, element);\n                }\n                return;\n            }\n            const attrValue = element.getAttribute(attrName);\n            if (attrValue) {\n                for (const qrl of attrValue.split("\\n")) {\n                    const url = qrlResolver(element, qrl);\n                    if (url) {\n                        const symbolName = getSymbolName(url);\n                        const handler = (win[url.pathname] || findModule(await import(url.href.split("#")[0])))[symbolName] || error(url + " does not export " + symbolName);\n                        const previousCtx = doc.__q_context__;\n                        if (element.isConnected) {\n                            try {\n                                doc.__q_context__ = [ element, ev, url ];\n                                await handler(ev, element);\n                            } finally {\n                                doc.__q_context__ = previousCtx;\n                                doc.dispatchEvent(createEvent("qsymbol", {\n                                    symbol: symbolName,\n                                    element: element\n                                }));\n                            }\n                        }\n                    }\n                }\n            }\n        };\n        const getSymbolName = url => url.hash.replace(/^#?([^?[|]*).*$/, "$1") || "default";\n        const processDocumentEvent = async ev => {\n            let element = ev.target;\n            broadcast("-document", ev.type, ev);\n            while (element && element.getAttribute) {\n                await dispatch(element, "", ev.type, ev);\n                element = ev.bubbles && !0 !== ev.cancelBubble ? element.parentElement : null;\n            }\n        };\n        const processWindowEvent = ev => {\n            broadcast("-window", ev.type, ev);\n        };\n        const processReadyStateChange = () => {\n            const readyState = doc.readyState;\n            if (!hasInitialized && ("interactive" == readyState || "complete" == readyState)) {\n                hasInitialized = 1;\n                broadcast("", "qinit", createEvent("qinit"));\n                const results = doc.querySelectorAll("[on\\\\:qvisible]");\n                if (results.length > 0) {\n                    const observer = new IntersectionObserver((entries => {\n                        for (const entry of entries) {\n                            if (entry.isIntersecting) {\n                                observer.unobserve(entry.target);\n                                dispatch(entry.target, "", "qvisible", createEvent("qvisible", entry));\n                            }\n                        }\n                    }));\n                    results.forEach((el => observer.observe(el)));\n                }\n            }\n        };\n        const events = new Set;\n        const push = eventNames => {\n            for (const eventName of eventNames) {\n                if (!events.has(eventName)) {\n                    document.addEventListener(eventName, processDocumentEvent, {\n                        capture: !0\n                    });\n                    win.addEventListener(eventName, processWindowEvent);\n                    events.add(eventName);\n                }\n            }\n        };\n        if (!doc.qR) {\n            const qwikevents = win.qwikevents;\n            Array.isArray(qwikevents) && push(qwikevents);\n            win.qwikevents = {\n                push: (...e) => push(e)\n            };\n            doc.addEventListener("readystatechange", processReadyStateChange);\n            processReadyStateChange();\n        }\n    })(document);\n})();';
function getQwikLoaderScript(opts = {}) {
  if (Array.isArray(opts.events) && opts.events.length > 0) {
    const loader = opts.debug ? QWIK_LOADER_OPTIMIZE_DEBUG : QWIK_LOADER_OPTIMIZE_MINIFIED;
    return loader.replace("window.qEvents", JSON.stringify(opts.events));
  }
  return opts.debug ? QWIK_LOADER_DEFAULT_DEBUG : QWIK_LOADER_DEFAULT_MINIFIED;
}
function getPrefetchResources(snapshotResult, opts, resolvedManifest) {
  if (!resolvedManifest) {
    return [];
  }
  const prefetchStrategy = opts.prefetchStrategy;
  const buildBase = getBuildBase(opts);
  if (prefetchStrategy !== null) {
    if (!prefetchStrategy || !prefetchStrategy.symbolsToPrefetch || prefetchStrategy.symbolsToPrefetch === "auto") {
      return getAutoPrefetch(snapshotResult, resolvedManifest, buildBase);
    }
    if (typeof prefetchStrategy.symbolsToPrefetch === "function") {
      try {
        return prefetchStrategy.symbolsToPrefetch({ manifest: resolvedManifest.manifest });
      } catch (e) {
        console.error("getPrefetchUrls, symbolsToPrefetch()", e);
      }
    }
  }
  return [];
}
function getAutoPrefetch(snapshotResult, resolvedManifest, buildBase) {
  const prefetchResources = [];
  const listeners = snapshotResult == null ? void 0 : snapshotResult.listeners;
  const stateObjs = snapshotResult == null ? void 0 : snapshotResult.objs;
  const { mapper, manifest: manifest2 } = resolvedManifest;
  const urls = /* @__PURE__ */ new Set();
  if (Array.isArray(listeners)) {
    for (const prioritizedSymbolName in mapper) {
      const hasSymbol = listeners.some((l) => {
        return l.qrl.getHash() === prioritizedSymbolName;
      });
      if (hasSymbol) {
        addBundle(manifest2, urls, prefetchResources, buildBase, mapper[prioritizedSymbolName][1]);
      }
    }
  }
  if (Array.isArray(stateObjs)) {
    for (const obj of stateObjs) {
      if (isQrl(obj)) {
        const qrlSymbolName = obj.getHash();
        const resolvedSymbol = mapper[qrlSymbolName];
        if (resolvedSymbol) {
          addBundle(manifest2, urls, prefetchResources, buildBase, resolvedSymbol[0]);
        }
      }
    }
  }
  return prefetchResources;
}
function addBundle(manifest2, urls, prefetchResources, buildBase, bundleFileName) {
  const url = buildBase + bundleFileName;
  if (!urls.has(url)) {
    urls.add(url);
    const bundle = manifest2.bundles[bundleFileName];
    if (bundle) {
      const prefetchResource = {
        url,
        imports: []
      };
      prefetchResources.push(prefetchResource);
      if (Array.isArray(bundle.imports)) {
        for (const importedFilename of bundle.imports) {
          addBundle(manifest2, urls, prefetchResource.imports, buildBase, importedFilename);
        }
      }
    }
  }
}
var isQrl = (value) => {
  return typeof value === "function" && typeof value.getSymbol === "function";
};
var qDev = globalThis.qDev === true;
var EMPTY_ARRAY = [];
var EMPTY_OBJ = {};
if (qDev) {
  Object.freeze(EMPTY_ARRAY);
  Object.freeze(EMPTY_OBJ);
  Error.stackTraceLimit = 9999;
}
[
  "click",
  "dblclick",
  "contextmenu",
  "auxclick",
  "pointerdown",
  "pointerup",
  "pointermove",
  "pointerover",
  "pointerenter",
  "pointerleave",
  "pointerout",
  "pointercancel",
  "gotpointercapture",
  "lostpointercapture",
  "touchstart",
  "touchend",
  "touchmove",
  "touchcancel",
  "mousedown",
  "mouseup",
  "mousemove",
  "mouseenter",
  "mouseleave",
  "mouseover",
  "mouseout",
  "wheel",
  "gesturestart",
  "gesturechange",
  "gestureend",
  "keydown",
  "keyup",
  "keypress",
  "input",
  "change",
  "search",
  "invalid",
  "beforeinput",
  "select",
  "focusin",
  "focusout",
  "focus",
  "blur",
  "submit",
  "reset",
  "scroll"
].map((n) => `on${n.toLowerCase()}$`);
[
  "useWatch$",
  "useClientEffect$",
  "useEffect$",
  "component$",
  "useStyles$",
  "useStylesScoped$"
].map((n) => n.toLowerCase());
function getValidManifest(manifest2) {
  if (manifest2 != null && manifest2.mapping != null && typeof manifest2.mapping === "object" && manifest2.symbols != null && typeof manifest2.symbols === "object" && manifest2.bundles != null && typeof manifest2.bundles === "object") {
    return manifest2;
  }
  return void 0;
}
function workerFetchScript() {
  const fetch2 = `Promise.all(e.data.map(u=>fetch(u))).finally(()=>{setTimeout(postMessage({}),9999)})`;
  const workerBody = `onmessage=(e)=>{${fetch2}}`;
  const blob = `new Blob(['${workerBody}'],{type:"text/javascript"})`;
  const url = `URL.createObjectURL(${blob})`;
  let s = `const w=new Worker(${url});`;
  s += `w.postMessage(u.map(u=>new URL(u,origin)+''));`;
  s += `w.onmessage=()=>{w.terminate()};`;
  return s;
}
function prefetchUrlsEventScript(prefetchResources) {
  const data = {
    bundles: flattenPrefetchResources(prefetchResources).map((u) => u.split("/").pop())
  };
  return `dispatchEvent(new CustomEvent("qprefetch",{detail:${JSON.stringify(data)}}))`;
}
function flattenPrefetchResources(prefetchResources) {
  const urls = [];
  const addPrefetchResource = (prefetchResources2) => {
    if (Array.isArray(prefetchResources2)) {
      for (const prefetchResource of prefetchResources2) {
        if (!urls.includes(prefetchResource.url)) {
          urls.push(prefetchResource.url);
          addPrefetchResource(prefetchResource.imports);
        }
      }
    }
  };
  addPrefetchResource(prefetchResources);
  return urls;
}
function applyPrefetchImplementation(opts, prefetchResources) {
  const { prefetchStrategy } = opts;
  if (prefetchStrategy !== null) {
    const prefetchImpl = normalizePrefetchImplementation(prefetchStrategy == null ? void 0 : prefetchStrategy.implementation);
    const prefetchNodes = [];
    if (prefetchImpl.prefetchEvent === "always") {
      prefetchUrlsEvent(prefetchNodes, prefetchResources);
    }
    if (prefetchImpl.linkInsert === "html-append") {
      linkHtmlImplementation(prefetchNodes, prefetchResources, prefetchImpl);
    }
    if (prefetchImpl.linkInsert === "js-append") {
      linkJsImplementation(prefetchNodes, prefetchResources, prefetchImpl);
    } else if (prefetchImpl.workerFetchInsert === "always") {
      workerFetchImplementation(prefetchNodes, prefetchResources);
    }
    if (prefetchNodes.length > 0) {
      return jsx(Fragment, { children: prefetchNodes });
    }
  }
  return null;
}
function prefetchUrlsEvent(prefetchNodes, prefetchResources) {
  prefetchNodes.push(
    jsx("script", {
      type: "module",
      dangerouslySetInnerHTML: prefetchUrlsEventScript(prefetchResources)
    })
  );
}
function linkHtmlImplementation(prefetchNodes, prefetchResources, prefetchImpl) {
  const urls = flattenPrefetchResources(prefetchResources);
  const rel = prefetchImpl.linkRel || "prefetch";
  for (const url of urls) {
    const attributes = {};
    attributes["href"] = url;
    attributes["rel"] = rel;
    if (rel === "prefetch" || rel === "preload") {
      if (url.endsWith(".js")) {
        attributes["as"] = "script";
      }
    }
    prefetchNodes.push(jsx("link", attributes, void 0));
  }
}
function linkJsImplementation(prefetchNodes, prefetchResources, prefetchImpl) {
  const rel = prefetchImpl.linkRel || "prefetch";
  let s = ``;
  if (prefetchImpl.workerFetchInsert === "no-link-support") {
    s += `let supportsLinkRel = true;`;
  }
  s += `const u=${JSON.stringify(flattenPrefetchResources(prefetchResources))};`;
  s += `u.map((u,i)=>{`;
  s += `const l=document.createElement('link');`;
  s += `l.setAttribute("href",u);`;
  s += `l.setAttribute("rel","${rel}");`;
  if (prefetchImpl.workerFetchInsert === "no-link-support") {
    s += `if(i===0){`;
    s += `try{`;
    s += `supportsLinkRel=l.relList.supports("${rel}");`;
    s += `}catch(e){}`;
    s += `}`;
  }
  s += `document.body.appendChild(l);`;
  s += `});`;
  if (prefetchImpl.workerFetchInsert === "no-link-support") {
    s += `if(!supportsLinkRel){`;
    s += workerFetchScript();
    s += `}`;
  }
  if (prefetchImpl.workerFetchInsert === "always") {
    s += workerFetchScript();
  }
  prefetchNodes.push(
    jsx("script", {
      type: "module",
      dangerouslySetInnerHTML: s
    })
  );
}
function workerFetchImplementation(prefetchNodes, prefetchResources) {
  let s = `const u=${JSON.stringify(flattenPrefetchResources(prefetchResources))};`;
  s += workerFetchScript();
  prefetchNodes.push(
    jsx("script", {
      type: "module",
      dangerouslySetInnerHTML: s
    })
  );
}
function normalizePrefetchImplementation(input) {
  if (typeof input === "string") {
    switch (input) {
      case "link-prefetch-html": {
        return {
          linkInsert: "html-append",
          linkRel: "prefetch",
          workerFetchInsert: null,
          prefetchEvent: null
        };
      }
      case "link-prefetch": {
        return {
          linkInsert: "js-append",
          linkRel: "prefetch",
          workerFetchInsert: "no-link-support",
          prefetchEvent: null
        };
      }
      case "link-preload-html": {
        return {
          linkInsert: "html-append",
          linkRel: "preload",
          workerFetchInsert: null,
          prefetchEvent: null
        };
      }
      case "link-preload": {
        return {
          linkInsert: "js-append",
          linkRel: "preload",
          workerFetchInsert: "no-link-support",
          prefetchEvent: null
        };
      }
      case "link-modulepreload-html": {
        return {
          linkInsert: "html-append",
          linkRel: "modulepreload",
          workerFetchInsert: null,
          prefetchEvent: null
        };
      }
      case "link-modulepreload": {
        return {
          linkInsert: "js-append",
          linkRel: "modulepreload",
          workerFetchInsert: "no-link-support",
          prefetchEvent: null
        };
      }
    }
    return {
      linkInsert: null,
      linkRel: null,
      workerFetchInsert: "always",
      prefetchEvent: null
    };
  }
  if (input && typeof input === "object") {
    return input;
  }
  const defaultImplementation = {
    linkInsert: null,
    linkRel: null,
    workerFetchInsert: "always",
    prefetchEvent: null
  };
  return defaultImplementation;
}
var DOCTYPE = "<!DOCTYPE html>";
async function renderToStream(rootNode, opts) {
  var _a2, _b, _c, _d, _e, _f;
  let stream = opts.stream;
  let bufferSize = 0;
  let totalSize = 0;
  let networkFlushes = 0;
  let firstFlushTime = 0;
  const inOrderStreaming = (_b = (_a2 = opts.streaming) == null ? void 0 : _a2.inOrder) != null ? _b : {
    strategy: "auto",
    maximunInitialChunk: 5e4,
    maximunChunk: 3e4
  };
  const containerTagName = (_c = opts.containerTagName) != null ? _c : "html";
  const containerAttributes = (_d = opts.containerAttributes) != null ? _d : {};
  let buffer = "";
  const nativeStream = stream;
  const firstFlushTimer = createTimer();
  function flush() {
    if (buffer) {
      nativeStream.write(buffer);
      buffer = "";
      bufferSize = 0;
      networkFlushes++;
      if (networkFlushes === 1) {
        firstFlushTime = firstFlushTimer();
      }
    }
  }
  function enqueue(chunk) {
    bufferSize += chunk.length;
    totalSize += chunk.length;
    buffer += chunk;
  }
  switch (inOrderStreaming.strategy) {
    case "disabled":
      stream = {
        write: enqueue
      };
      break;
    case "direct":
      stream = nativeStream;
      break;
    case "auto":
      let count = 0;
      let forceFlush = false;
      const minimunChunkSize = (_e = inOrderStreaming.maximunChunk) != null ? _e : 0;
      const initialChunkSize = (_f = inOrderStreaming.maximunInitialChunk) != null ? _f : 0;
      stream = {
        write(chunk) {
          if (chunk === "<!--qkssr-f-->") {
            forceFlush || (forceFlush = true);
          } else if (chunk === "<!--qkssr-pu-->") {
            count++;
          } else if (chunk === "<!--qkssr-po-->") {
            count--;
          } else {
            enqueue(chunk);
          }
          const chunkSize = networkFlushes === 0 ? initialChunkSize : minimunChunkSize;
          if (count === 0 && (forceFlush || bufferSize >= chunkSize)) {
            forceFlush = false;
            flush();
          }
        }
      };
      break;
  }
  if (containerTagName === "html") {
    stream.write(DOCTYPE);
  } else {
    if (opts.qwikLoader) {
      if (opts.qwikLoader.include === void 0) {
        opts.qwikLoader.include = "never";
      }
      if (opts.qwikLoader.position === void 0) {
        opts.qwikLoader.position = "bottom";
      }
    } else {
      opts.qwikLoader = {
        include: "never"
      };
    }
  }
  if (!opts.manifest) {
    console.warn("Missing client manifest, loading symbols in the client might 404");
  }
  const buildBase = getBuildBase(opts);
  const resolvedManifest = resolveManifest(opts.manifest);
  await setServerPlatform(opts, resolvedManifest);
  let prefetchResources = [];
  let snapshotResult = null;
  const injections = resolvedManifest == null ? void 0 : resolvedManifest.manifest.injections;
  const beforeContent = injections ? injections.map((injection) => {
    var _a3;
    return jsx(injection.tag, (_a3 = injection.attributes) != null ? _a3 : EMPTY_OBJ);
  }) : void 0;
  const renderTimer = createTimer();
  const renderSymbols = [];
  let renderTime = 0;
  let snapshotTime = 0;
  await renderSSR(rootNode, {
    stream,
    containerTagName,
    containerAttributes,
    envData: opts.envData,
    base: buildBase,
    beforeContent,
    beforeClose: async (contexts, containerState) => {
      var _a3, _b2, _c2;
      renderTime = renderTimer();
      const snapshotTimer = createTimer();
      snapshotResult = await _pauseFromContexts(contexts, containerState);
      prefetchResources = getPrefetchResources(snapshotResult, opts, resolvedManifest);
      const jsonData = JSON.stringify(snapshotResult.state, void 0, qDev ? "  " : void 0);
      const children = [
        jsx("script", {
          type: "qwik/json",
          dangerouslySetInnerHTML: escapeText(jsonData)
        })
      ];
      if (prefetchResources.length > 0) {
        children.push(applyPrefetchImplementation(opts, prefetchResources));
      }
      const needLoader = !snapshotResult || snapshotResult.mode !== "static";
      const includeMode = (_b2 = (_a3 = opts.qwikLoader) == null ? void 0 : _a3.include) != null ? _b2 : "auto";
      const includeLoader = includeMode === "always" || includeMode === "auto" && needLoader;
      if (includeLoader) {
        const qwikLoaderScript = getQwikLoaderScript({
          events: (_c2 = opts.qwikLoader) == null ? void 0 : _c2.events,
          debug: opts.debug
        });
        children.push(
          jsx("script", {
            id: "qwikloader",
            dangerouslySetInnerHTML: qwikLoaderScript
          })
        );
      }
      const uniqueListeners = /* @__PURE__ */ new Set();
      snapshotResult.listeners.forEach((li) => {
        uniqueListeners.add(JSON.stringify(li.eventName));
      });
      const extraListeners = Array.from(uniqueListeners);
      if (extraListeners.length > 0) {
        let content = `window.qwikevents.push(${extraListeners.join(", ")})`;
        if (!includeLoader) {
          content = `window.qwikevents||=[];${content}`;
        }
        children.push(
          jsx("script", {
            dangerouslySetInnerHTML: content
          })
        );
      }
      collectRenderSymbols(renderSymbols, contexts);
      snapshotTime = snapshotTimer();
      return jsx(Fragment, { children });
    }
  });
  flush();
  const result = {
    prefetchResources: void 0,
    snapshotResult,
    flushes: networkFlushes,
    manifest: resolvedManifest == null ? void 0 : resolvedManifest.manifest,
    size: totalSize,
    timing: {
      render: renderTime,
      snapshot: snapshotTime,
      firstFlush: firstFlushTime
    },
    _symbols: renderSymbols
  };
  return result;
}
function resolveManifest(manifest2) {
  if (!manifest2) {
    return void 0;
  }
  if ("mapper" in manifest2) {
    return manifest2;
  }
  manifest2 = getValidManifest(manifest2);
  if (manifest2) {
    const mapper = {};
    Object.entries(manifest2.mapping).forEach(([key, value]) => {
      mapper[getSymbolHash(key)] = [key, value];
    });
    return {
      mapper,
      manifest: manifest2
    };
  }
  return void 0;
}
var escapeText = (str) => {
  return str.replace(/<(\/?script)/g, "\\x3C$1");
};
function collectRenderSymbols(renderSymbols, elements) {
  var _a2;
  for (const ctx of elements) {
    const symbol = (_a2 = ctx.$renderQrl$) == null ? void 0 : _a2.getSymbol();
    if (symbol && !renderSymbols.includes(symbol)) {
      renderSymbols.push(symbol);
    }
  }
}
const manifest = { "symbols": { "s_04Gb0onajK8": { "origin": "routes/[...lang]/index.tsx", "displayName": "____lang__component_Speak_nav_div_onClick", "canonicalFilename": "s_04gb0onajk8", "hash": "04Gb0onajK8", "ctxKind": "event", "ctxName": "onClick$", "captures": true, "parent": "s_jpH0I2vriFs" }, "s_204TbHXWOvo": { "origin": "routes/[...lang]/index.tsx", "displayName": "____lang__component_Speak_nav_div_onClick_1", "canonicalFilename": "s_204tbhxwovo", "hash": "204TbHXWOvo", "ctxKind": "event", "ctxName": "onClick$", "captures": true, "parent": "s_jpH0I2vriFs" }, "s_EAv00I00cOE": { "origin": "components/change-local/index.tsx", "displayName": "ChangeLocale_component_div_div_onClick", "canonicalFilename": "s_eav00i00coe", "hash": "EAv00I00cOE", "ctxKind": "event", "ctxName": "onClick$", "captures": true, "parent": "s_fykAOQuHiRY" }, "s_SQyJVtrX8H0": { "origin": "routes/[...lang]/index.tsx", "displayName": "____lang__component_Speak_section_i_onClick", "canonicalFilename": "s_sqyjvtrx8h0", "hash": "SQyJVtrX8H0", "ctxKind": "event", "ctxName": "onClick$", "captures": true, "parent": "s_jpH0I2vriFs" }, "s_Vfz0HJPfQ2A": { "origin": "routes/[...lang]/index.tsx", "displayName": "____lang__component_Speak_div_div_div_onClick", "canonicalFilename": "s_vfz0hjpfq2a", "hash": "Vfz0HJPfQ2A", "ctxKind": "event", "ctxName": "onClick$", "captures": true, "parent": "s_jpH0I2vriFs" }, "s_Y100P8CFH8E": { "origin": "routes/[...lang]/index.tsx", "displayName": "____lang__component_Speak_section_i_onClick_1", "canonicalFilename": "s_y100p8cfh8e", "hash": "Y100P8CFH8E", "ctxKind": "event", "ctxName": "onClick$", "captures": true, "parent": "s_jpH0I2vriFs" }, "s_hA9UPaY8sNQ": { "origin": "../node_modules/@builder.io/qwik-city/index.qwik.mjs", "displayName": "Link_component_a_onClick", "canonicalFilename": "s_ha9upay8snq", "hash": "hA9UPaY8sNQ", "ctxKind": "event", "ctxName": "onClick$", "captures": true, "parent": "s_mYsiJcA4IBc" }, "s_mLGQcH9DZ50": { "origin": "routes/[...lang]/index.tsx", "displayName": "____lang__component_Speak_section_div_div__Fragment_div_div_div_onClick", "canonicalFilename": "s_mlgqch9dz50", "hash": "mLGQcH9DZ50", "ctxKind": "event", "ctxName": "onClick$", "captures": true, "parent": "s_jpH0I2vriFs" }, "s_uWYnMcm8YUA": { "origin": "routes/[...lang]/index.tsx", "displayName": "____lang__component_Speak_div_div_onClick", "canonicalFilename": "s_uwynmcm8yua", "hash": "uWYnMcm8YUA", "ctxKind": "event", "ctxName": "onClick$", "captures": true, "parent": "s_jpH0I2vriFs" }, "s_wzBaSJX01eI": { "origin": "routes/[...lang]/index.tsx", "displayName": "____lang__component_Speak_div_div_div_onClick_1", "canonicalFilename": "s_wzbasjx01ei", "hash": "wzBaSJX01eI", "ctxKind": "event", "ctxName": "onClick$", "captures": true, "parent": "s_jpH0I2vriFs" }, "s_skxgNVWVOT8": { "origin": "../node_modules/@builder.io/qwik-city/index.qwik.mjs", "displayName": "Link_component_a_onMouseOver", "canonicalFilename": "s_skxgnvwvot8", "hash": "skxgNVWVOT8", "ctxKind": "event", "ctxName": "onMouseOver$", "captures": false, "parent": "s_mYsiJcA4IBc" }, "s_uVE5iM9H73c": { "origin": "../node_modules/@builder.io/qwik-city/index.qwik.mjs", "displayName": "Link_component_a_onQVisible", "canonicalFilename": "s_uve5im9h73c", "hash": "uVE5iM9H73c", "ctxKind": "event", "ctxName": "onQVisible$", "captures": false, "parent": "s_mYsiJcA4IBc" }, "s_AaAlzKH0KlQ": { "origin": "../node_modules/@builder.io/qwik-city/index.qwik.mjs", "displayName": "QwikCity_component_useWatch", "canonicalFilename": "s_aaalzkh0klq", "hash": "AaAlzKH0KlQ", "ctxKind": "function", "ctxName": "useWatch$", "captures": true, "parent": "s_z1nvHyEppoI" }, "s_3sccYCDd1Z0": { "origin": "root.tsx", "displayName": "root_component", "canonicalFilename": "s_3sccycdd1z0", "hash": "3sccYCDd1Z0", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null }, "s_KH4R1BTHGdA": { "origin": "routes/[...lang]/layout.tsx", "displayName": "layout_component", "canonicalFilename": "s_kh4r1bthgda", "hash": "KH4R1BTHGdA", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null }, "s_RizPy0NEy9M": { "origin": "../node_modules/qwik-speak/lib/index.qwik.mjs", "displayName": "QwikSpeak_component", "canonicalFilename": "s_rizpy0ney9m", "hash": "RizPy0NEy9M", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null }, "s_fykAOQuHiRY": { "origin": "components/change-local/index.tsx", "displayName": "ChangeLocale_component", "canonicalFilename": "s_fykaoquhiry", "hash": "fykAOQuHiRY", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null }, "s_jpH0I2vriFs": { "origin": "routes/[...lang]/index.tsx", "displayName": "____lang__component", "canonicalFilename": "s_jph0i2vrifs", "hash": "jpH0I2vriFs", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null }, "s_k0JdB1hwHVc": { "origin": "../node_modules/qwik-speak/lib/index.qwik.mjs", "displayName": "Speak_component", "canonicalFilename": "s_k0jdb1hwhvc", "hash": "k0JdB1hwHVc", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null }, "s_mYsiJcA4IBc": { "origin": "../node_modules/@builder.io/qwik-city/index.qwik.mjs", "displayName": "Link_component", "canonicalFilename": "s_mysijca4ibc", "hash": "mYsiJcA4IBc", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null }, "s_nd8yk3KO22c": { "origin": "../node_modules/@builder.io/qwik-city/index.qwik.mjs", "displayName": "RouterOutlet_component", "canonicalFilename": "s_nd8yk3ko22c", "hash": "nd8yk3KO22c", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null }, "s_z1nvHyEppoI": { "origin": "../node_modules/@builder.io/qwik-city/index.qwik.mjs", "displayName": "QwikCity_component", "canonicalFilename": "s_z1nvhyeppoi", "hash": "z1nvHyEppoI", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null }, "s_zrbrqoaqXSY": { "origin": "components/router-head/router-head.tsx", "displayName": "RouterHead_component", "canonicalFilename": "s_zrbrqoaqxsy", "hash": "zrbrqoaqXSY", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null }, "s_hO3b5j0m2ZI": { "origin": "root.tsx", "displayName": "root_component_useStyles", "canonicalFilename": "s_ho3b5j0m2zi", "hash": "hO3b5j0m2ZI", "ctxKind": "function", "ctxName": "useStyles$", "captures": false, "parent": "s_3sccYCDd1Z0" }, "s_huoEr0HZ0fo": { "origin": "routes/[...lang]/index.tsx", "displayName": "____lang__component_useStylesScoped", "canonicalFilename": "s_huoer0hz0fo", "hash": "huoEr0HZ0fo", "ctxKind": "function", "ctxName": "useStylesScoped$", "captures": false, "parent": "s_jpH0I2vriFs" }, "s_XwAYrqzfHSc": { "origin": "speak-config.ts", "displayName": "loadTranslation", "canonicalFilename": "s_xwayrqzfhsc", "hash": "XwAYrqzfHSc", "ctxKind": "function", "ctxName": "$", "captures": false, "parent": null }, "s_40VQUrrUu08": { "origin": "../node_modules/qwik-speak/lib/index.qwik.mjs", "displayName": "QwikSpeak_component_resolvedTranslationFn", "canonicalFilename": "s_40vqurruu08", "hash": "40VQUrrUu08", "ctxKind": "function", "ctxName": "loadTranslation$", "captures": false, "parent": "s_RizPy0NEy9M" }, "s_7lFwWb3B7fc": { "origin": "../node_modules/qwik-speak/lib/index.qwik.mjs", "displayName": "Speak_component_useMount", "canonicalFilename": "s_7lfwwb3b7fc", "hash": "7lFwWb3B7fc", "ctxKind": "function", "ctxName": "useMount$", "captures": true, "parent": "s_k0JdB1hwHVc" }, "s_KG1JVWT5AXk": { "origin": "../node_modules/qwik-speak/lib/index.qwik.mjs", "displayName": "QwikSpeak_component_useMount", "canonicalFilename": "s_kg1jvwt5axk", "hash": "KG1JVWT5AXk", "ctxKind": "function", "ctxName": "useMount$", "captures": true, "parent": "s_RizPy0NEy9M" }, "s_YUHyy9C71gg": { "origin": "components/change-local/index.tsx", "displayName": "ChangeLocale_component_changeLocale", "canonicalFilename": "s_yuhyy9c71gg", "hash": "YUHyy9C71gg", "ctxKind": "function", "ctxName": "$", "captures": true, "parent": "s_fykAOQuHiRY" } }, "mapping": { "s_04Gb0onajK8": "q-5b56768b.js", "s_204TbHXWOvo": "q-5b56768b.js", "s_EAv00I00cOE": "q-630c41ac.js", "s_SQyJVtrX8H0": "q-5b56768b.js", "s_Vfz0HJPfQ2A": "q-5b56768b.js", "s_Y100P8CFH8E": "q-5b56768b.js", "s_hA9UPaY8sNQ": "q-6e629e14.js", "s_mLGQcH9DZ50": "q-5b56768b.js", "s_uWYnMcm8YUA": "q-5b56768b.js", "s_wzBaSJX01eI": "q-5b56768b.js", "s_skxgNVWVOT8": "q-6e629e14.js", "s_uVE5iM9H73c": "q-6e629e14.js", "s_AaAlzKH0KlQ": "q-ed4e65b1.js", "s_3sccYCDd1Z0": "q-a7b5c029.js", "s_KH4R1BTHGdA": "q-5987959d.js", "s_RizPy0NEy9M": "q-2d1a712e.js", "s_fykAOQuHiRY": "q-630c41ac.js", "s_jpH0I2vriFs": "q-5b56768b.js", "s_k0JdB1hwHVc": "q-c5362d42.js", "s_mYsiJcA4IBc": "q-6e629e14.js", "s_nd8yk3KO22c": "q-53db9738.js", "s_z1nvHyEppoI": "q-ed4e65b1.js", "s_zrbrqoaqXSY": "q-4234aef3.js", "s_hO3b5j0m2ZI": "q-a7b5c029.js", "s_huoEr0HZ0fo": "q-5b56768b.js", "s_XwAYrqzfHSc": "q-146dbbe7.js", "s_40VQUrrUu08": "q-2d1a712e.js", "s_7lFwWb3B7fc": "q-c5362d42.js", "s_KG1JVWT5AXk": "q-2d1a712e.js", "s_YUHyy9C71gg": "q-630c41ac.js" }, "bundles": { "q-143c7194.js": { "size": 2180, "origins": ["node_modules/@builder.io/qwik-city/service-worker.mjs", "src/routes/service-worker.js"] }, "q-146dbbe7.js": { "size": 211, "imports": ["q-5755e1d0.js", "q-62c40315.js"], "origins": ["src/entry_loadTranslation.js", "src/s_xwayrqzfhsc.js"], "symbols": ["s_XwAYrqzfHSc"] }, "q-228aedc5.js": { "size": 58, "imports": ["q-62c40315.js"] }, "q-2d1a712e.js": { "size": 1489, "imports": ["q-5755e1d0.js", "q-62c40315.js", "q-a7b5c029.js"], "origins": ["src/entry_QwikSpeak.js", "src/s_40vqurruu08.js", "src/s_kg1jvwt5axk.js", "src/s_rizpy0ney9m.js"], "symbols": ["s_40VQUrrUu08", "s_KG1JVWT5AXk", "s_RizPy0NEy9M"] }, "q-4234aef3.js": { "size": 1030, "imports": ["q-62c40315.js", "q-a7b5c029.js"], "origins": ["src/entry_RouterHead.js", "src/s_zrbrqoaqxsy.js"], "symbols": ["s_zrbrqoaqXSY"] }, "q-5089877a.js": { "size": 175, "imports": ["q-62c40315.js"], "dynamicImports": ["q-5987959d.js"], "origins": ["src/routes/[...lang]/layout.js"] }, "q-53db9738.js": { "size": 269, "imports": ["q-62c40315.js", "q-a7b5c029.js"], "origins": ["src/entry_RouterOutlet.js", "src/s_nd8yk3ko22c.js"], "symbols": ["s_nd8yk3KO22c"] }, "q-5755e1d0.js": { "size": 39, "origins": ["@builder.io/qwik/build"] }, "q-5967cf32.js": { "size": 218, "imports": ["q-62c40315.js"], "dynamicImports": ["q-5b56768b.js"], "origins": ["src/routes/[...lang]/index.js"] }, "q-5987959d.js": { "size": 114, "imports": ["q-62c40315.js"], "origins": ["src/entry_layout.js", "src/s_kh4r1bthgda.js"], "symbols": ["s_KH4R1BTHGdA"] }, "q-5b56768b.js": { "size": 42946, "imports": ["q-62c40315.js", "q-a7b5c029.js"], "dynamicImports": ["q-630c41ac.js"], "origins": ["src/components/change-local/index.tsx", "src/components/icons/logo-alt.js", "src/components/icons/logo.js", "src/entry_____lang_.js", "src/routes/[...lang]/index.scss?used", "src/s_04gb0onajk8.js", "src/s_204tbhxwovo.js", "src/s_huoer0hz0fo.js", "src/s_jph0i2vrifs.js", "src/s_mlgqch9dz50.js", "src/s_sqyjvtrx8h0.js", "src/s_uwynmcm8yua.js", "src/s_vfz0hjpfq2a.js", "src/s_wzbasjx01ei.js", "src/s_y100p8cfh8e.js"], "symbols": ["s_04Gb0onajK8", "s_204TbHXWOvo", "s_huoEr0HZ0fo", "s_jpH0I2vriFs", "s_mLGQcH9DZ50", "s_SQyJVtrX8H0", "s_uWYnMcm8YUA", "s_Vfz0HJPfQ2A", "s_wzBaSJX01eI", "s_Y100P8CFH8E"] }, "q-62c40315.js": { "size": 36011, "dynamicImports": ["q-a7b5c029.js"], "origins": ["\0vite/preload-helper", "node_modules/@builder.io/qwik/core.min.mjs", "src/root.js"] }, "q-630c41ac.js": { "size": 1181, "imports": ["q-62c40315.js", "q-a7b5c029.js"], "origins": ["src/entry_ChangeLocale.js", "src/s_eav00i00coe.js", "src/s_fykaoquhiry.js", "src/s_yuhyy9c71gg.js"], "symbols": ["s_EAv00I00cOE", "s_fykAOQuHiRY", "s_YUHyy9C71gg"] }, "q-6e629e14.js": { "size": 886, "imports": ["q-62c40315.js", "q-a7b5c029.js"], "origins": ["src/entry_Link.js", "src/s_ha9upay8snq.js", "src/s_mysijca4ibc.js", "src/s_skxgnvwvot8.js", "src/s_uve5im9h73c.js"], "symbols": ["s_hA9UPaY8sNQ", "s_mYsiJcA4IBc", "s_skxgNVWVOT8", "s_uVE5iM9H73c"] }, "q-a7b5c029.js": { "size": 121739, "imports": ["q-62c40315.js"], "dynamicImports": ["q-146dbbe7.js", "q-2d1a712e.js", "q-4234aef3.js", "q-53db9738.js", "q-6e629e14.js", "q-c5362d42.js", "q-e3ca7c95.js", "q-ed4e65b1.js"], "origins": ["node_modules/@builder.io/qwik-city/index.qwik.mjs", "node_modules/qwik-speak/lib/index.qwik.mjs", "src/components/router-head/router-head.js", "src/entry_root.js", "src/global.scss?used&inline", "src/s_3sccycdd1z0.js", "src/s_ho3b5j0m2zi.js", "src/speak-config.js"], "symbols": ["s_3sccYCDd1Z0", "s_hO3b5j0m2ZI"] }, "q-c1a68109.js": { "size": 128, "imports": ["q-62c40315.js"], "dynamicImports": ["q-143c7194.js"], "origins": ["@qwik-city-entries"] }, "q-c5362d42.js": { "size": 788, "imports": ["q-62c40315.js", "q-a7b5c029.js"], "origins": ["src/entry_Speak.js", "src/s_7lfwwb3b7fc.js", "src/s_k0jdb1hwhvc.js"], "symbols": ["s_7lFwWb3B7fc", "s_k0JdB1hwHVc"] }, "q-e3ca7c95.js": { "size": 367, "imports": ["q-62c40315.js"], "dynamicImports": ["q-5089877a.js", "q-5967cf32.js", "q-c1a68109.js"], "origins": ["@qwik-city-plan"] }, "q-ed4e65b1.js": { "size": 1522, "imports": ["q-5755e1d0.js", "q-62c40315.js", "q-a7b5c029.js"], "dynamicImports": ["q-e3ca7c95.js"], "origins": ["src/entry_QwikCity.js", "src/s_aaalzkh0klq.js", "src/s_z1nvhyeppoi.js"], "symbols": ["s_AaAlzKH0KlQ", "s_z1nvHyEppoI"] } }, "injections": [{ "tag": "link", "location": "head", "attributes": { "rel": "stylesheet", "href": "/build/q-b70261df.css" } }], "version": "1", "options": { "target": "client", "buildMode": "production", "forceFullBuild": true, "entryStrategy": { "type": "smart" } }, "platform": { "qwik": "0.9.0", "vite": "", "rollup": "2.78.1", "env": "node", "os": "win32", "node": "18.12.1" } };
const RouterHead = /* @__PURE__ */ componentQrl(inlinedQrl(() => {
  const head2 = useDocumentHead();
  const loc = useLocation();
  return /* @__PURE__ */ jsx(Fragment, {
    children: [
      /* @__PURE__ */ jsx("title", {
        children: head2.title
      }),
      /* @__PURE__ */ jsx("link", {
        rel: "canonical",
        href: loc.href
      }),
      /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0"
      }),
      /* @__PURE__ */ jsx("link", {
        rel: "icon",
        type: "image/ico",
        href: "/logo.ico"
      }),
      /* @__PURE__ */ jsx("link", {
        rel: "preconnect",
        href: "https://fonts.googleapis.com"
      }),
      /* @__PURE__ */ jsx("link", {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: ""
      }),
      /* @__PURE__ */ jsx("link", {
        href: "https://fonts.googleapis.com/css2?family=Poppins&display=swap",
        rel: "stylesheet"
      }),
      /* @__PURE__ */ jsx("link", {
        href: "https://fonts.googleapis.com/css?family=Montserrat:wght@100,200,300,400,500,600,700,800,900",
        rel: "stylesheet"
      }),
      /* @__PURE__ */ jsx("meta", {
        property: "og:site_name",
        content: "Qwik"
      }),
      /* @__PURE__ */ jsx("meta", {
        name: "twitter:site",
        content: "@QwikDev"
      }),
      /* @__PURE__ */ jsx("meta", {
        name: "twitter:title",
        content: "Qwik"
      }),
      head2.meta.map((m) => /* @__PURE__ */ jsx("meta", {
        ...m
      })),
      head2.links.map((l) => /* @__PURE__ */ jsx("link", {
        ...l
      })),
      head2.styles.map((s) => /* @__PURE__ */ jsx("style", {
        ...s.props,
        dangerouslySetInnerHTML: s.style
      }))
    ]
  });
}, "s_zrbrqoaqXSY"));
const styles = '/*!\n * Font Awesome Free 6.2.0 by @fontawesome - https://fontawesome.com\n * License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)\n * Copyright 2022 Fonticons, Inc.\n */\n.fa {\n  font-family: var(--fa-style-family, "Font Awesome 6 Free");\n  font-weight: var(--fa-style, 900);\n}\n\n.fa,\n.fa-classic,\n.fa-sharp,\n.fas,\n.fa-solid,\n.far,\n.fa-regular,\n.fab,\n.fa-brands {\n  -moz-osx-font-smoothing: grayscale;\n  -webkit-font-smoothing: antialiased;\n  display: var(--fa-display, inline-block);\n  font-style: normal;\n  font-variant: normal;\n  line-height: 1;\n  text-rendering: auto;\n}\n\n.fas,\n.fa-classic,\n.fa-solid,\n.far,\n.fa-regular {\n  font-family: "Font Awesome 6 Free";\n}\n\n.fab,\n.fa-brands {\n  font-family: "Font Awesome 6 Brands";\n}\n\n.fa-1x {\n  font-size: 1em;\n}\n\n.fa-2x {\n  font-size: 2em;\n}\n\n.fa-3x {\n  font-size: 3em;\n}\n\n.fa-4x {\n  font-size: 4em;\n}\n\n.fa-5x {\n  font-size: 5em;\n}\n\n.fa-6x {\n  font-size: 6em;\n}\n\n.fa-7x {\n  font-size: 7em;\n}\n\n.fa-8x {\n  font-size: 8em;\n}\n\n.fa-9x {\n  font-size: 9em;\n}\n\n.fa-10x {\n  font-size: 10em;\n}\n\n.fa-2xs {\n  font-size: 0.625em;\n  line-height: 0.1em;\n  vertical-align: 0.225em;\n}\n\n.fa-xs {\n  font-size: 0.75em;\n  line-height: 0.0833333337em;\n  vertical-align: 0.125em;\n}\n\n.fa-sm {\n  font-size: 0.875em;\n  line-height: 0.0714285718em;\n  vertical-align: 0.0535714295em;\n}\n\n.fa-lg {\n  font-size: 1.25em;\n  line-height: 0.05em;\n  vertical-align: -0.075em;\n}\n\n.fa-xl {\n  font-size: 1.5em;\n  line-height: 0.0416666682em;\n  vertical-align: -0.125em;\n}\n\n.fa-2xl {\n  font-size: 2em;\n  line-height: 0.03125em;\n  vertical-align: -0.1875em;\n}\n\n.fa-fw {\n  text-align: center;\n  width: 1.25em;\n}\n\n.fa-ul {\n  list-style-type: none;\n  margin-left: var(--fa-li-margin, 2.5em);\n  padding-left: 0;\n}\n.fa-ul > li {\n  position: relative;\n}\n\n.fa-li {\n  left: calc(var(--fa-li-width, 2em) * -1);\n  position: absolute;\n  text-align: center;\n  width: var(--fa-li-width, 2em);\n  line-height: inherit;\n}\n\n.fa-border {\n  border-color: var(--fa-border-color, #eee);\n  border-radius: var(--fa-border-radius, 0.1em);\n  border-style: var(--fa-border-style, solid);\n  border-width: var(--fa-border-width, 0.08em);\n  padding: var(--fa-border-padding, 0.2em 0.25em 0.15em);\n}\n\n.fa-pull-left {\n  float: left;\n  margin-right: var(--fa-pull-margin, 0.3em);\n}\n\n.fa-pull-right {\n  float: right;\n  margin-left: var(--fa-pull-margin, 0.3em);\n}\n\n.fa-beat {\n  animation-name: fa-beat;\n  animation-delay: var(--fa-animation-delay, 0s);\n  animation-direction: var(--fa-animation-direction, normal);\n  animation-duration: var(--fa-animation-duration, 1s);\n  animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  animation-timing-function: var(--fa-animation-timing, ease-in-out);\n}\n\n.fa-bounce {\n  animation-name: fa-bounce;\n  animation-delay: var(--fa-animation-delay, 0s);\n  animation-direction: var(--fa-animation-direction, normal);\n  animation-duration: var(--fa-animation-duration, 1s);\n  animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.28, 0.84, 0.42, 1));\n}\n\n.fa-fade {\n  animation-name: fa-fade;\n  animation-delay: var(--fa-animation-delay, 0s);\n  animation-direction: var(--fa-animation-direction, normal);\n  animation-duration: var(--fa-animation-duration, 1s);\n  animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));\n}\n\n.fa-beat-fade {\n  animation-name: fa-beat-fade;\n  animation-delay: var(--fa-animation-delay, 0s);\n  animation-direction: var(--fa-animation-direction, normal);\n  animation-duration: var(--fa-animation-duration, 1s);\n  animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));\n}\n\n.fa-flip {\n  animation-name: fa-flip;\n  animation-delay: var(--fa-animation-delay, 0s);\n  animation-direction: var(--fa-animation-direction, normal);\n  animation-duration: var(--fa-animation-duration, 1s);\n  animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  animation-timing-function: var(--fa-animation-timing, ease-in-out);\n}\n\n.fa-shake {\n  animation-name: fa-shake;\n  animation-delay: var(--fa-animation-delay, 0s);\n  animation-direction: var(--fa-animation-direction, normal);\n  animation-duration: var(--fa-animation-duration, 1s);\n  animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  animation-timing-function: var(--fa-animation-timing, linear);\n}\n\n.fa-spin {\n  animation-name: fa-spin;\n  animation-delay: var(--fa-animation-delay, 0s);\n  animation-direction: var(--fa-animation-direction, normal);\n  animation-duration: var(--fa-animation-duration, 2s);\n  animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  animation-timing-function: var(--fa-animation-timing, linear);\n}\n\n.fa-spin-reverse {\n  --fa-animation-direction: reverse;\n}\n\n.fa-pulse,\n.fa-spin-pulse {\n  animation-name: fa-spin;\n  animation-direction: var(--fa-animation-direction, normal);\n  animation-duration: var(--fa-animation-duration, 1s);\n  animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  animation-timing-function: var(--fa-animation-timing, steps(8));\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .fa-beat,\n  .fa-bounce,\n  .fa-fade,\n  .fa-beat-fade,\n  .fa-flip,\n  .fa-pulse,\n  .fa-shake,\n  .fa-spin,\n  .fa-spin-pulse {\n    animation-delay: -1ms;\n    animation-duration: 1ms;\n    animation-iteration-count: 1;\n    transition-delay: 0s;\n    transition-duration: 0s;\n  }\n}\n@keyframes fa-beat {\n  0%, 90% {\n    transform: scale(1);\n  }\n  45% {\n    transform: scale(var(--fa-beat-scale, 1.25));\n  }\n}\n@keyframes fa-bounce {\n  0% {\n    transform: scale(1, 1) translateY(0);\n  }\n  10% {\n    transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);\n  }\n  30% {\n    transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));\n  }\n  50% {\n    transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);\n  }\n  57% {\n    transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));\n  }\n  64% {\n    transform: scale(1, 1) translateY(0);\n  }\n  100% {\n    transform: scale(1, 1) translateY(0);\n  }\n}\n@keyframes fa-fade {\n  50% {\n    opacity: var(--fa-fade-opacity, 0.4);\n  }\n}\n@keyframes fa-beat-fade {\n  0%, 100% {\n    opacity: var(--fa-beat-fade-opacity, 0.4);\n    transform: scale(1);\n  }\n  50% {\n    opacity: 1;\n    transform: scale(var(--fa-beat-fade-scale, 1.125));\n  }\n}\n@keyframes fa-flip {\n  50% {\n    transform: rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -180deg));\n  }\n}\n@keyframes fa-shake {\n  0% {\n    transform: rotate(-15deg);\n  }\n  4% {\n    transform: rotate(15deg);\n  }\n  8%, 24% {\n    transform: rotate(-18deg);\n  }\n  12%, 28% {\n    transform: rotate(18deg);\n  }\n  16% {\n    transform: rotate(-22deg);\n  }\n  20% {\n    transform: rotate(22deg);\n  }\n  32% {\n    transform: rotate(-12deg);\n  }\n  36% {\n    transform: rotate(12deg);\n  }\n  40%, 100% {\n    transform: rotate(0deg);\n  }\n}\n@keyframes fa-spin {\n  0% {\n    transform: rotate(0deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}\n.fa-rotate-90 {\n  transform: rotate(90deg);\n}\n\n.fa-rotate-180 {\n  transform: rotate(180deg);\n}\n\n.fa-rotate-270 {\n  transform: rotate(270deg);\n}\n\n.fa-flip-horizontal {\n  transform: scale(-1, 1);\n}\n\n.fa-flip-vertical {\n  transform: scale(1, -1);\n}\n\n.fa-flip-both,\n.fa-flip-horizontal.fa-flip-vertical {\n  transform: scale(-1, -1);\n}\n\n.fa-rotate-by {\n  transform: rotate(var(--fa-rotate-angle, none));\n}\n\n.fa-stack {\n  display: inline-block;\n  height: 2em;\n  line-height: 2em;\n  position: relative;\n  vertical-align: middle;\n  width: 2.5em;\n}\n\n.fa-stack-1x,\n.fa-stack-2x {\n  left: 0;\n  position: absolute;\n  text-align: center;\n  width: 100%;\n  z-index: var(--fa-stack-z-index, auto);\n}\n\n.fa-stack-1x {\n  line-height: inherit;\n}\n\n.fa-stack-2x {\n  font-size: 2em;\n}\n\n.fa-inverse {\n  color: var(--fa-inverse, #fff);\n}\n\n/* Font Awesome uses the Unicode Private Use Area (PUA) to ensure screen\nreaders do not read off random characters that represent icons */\n.fa-0::before {\n  content: "\\30 ";\n}\n\n.fa-1::before {\n  content: "\\31 ";\n}\n\n.fa-2::before {\n  content: "\\32 ";\n}\n\n.fa-3::before {\n  content: "\\33 ";\n}\n\n.fa-4::before {\n  content: "\\34 ";\n}\n\n.fa-5::before {\n  content: "\\35 ";\n}\n\n.fa-6::before {\n  content: "\\36 ";\n}\n\n.fa-7::before {\n  content: "\\37 ";\n}\n\n.fa-8::before {\n  content: "\\38 ";\n}\n\n.fa-9::before {\n  content: "\\39 ";\n}\n\n.fa-fill-drip::before {\n  content: "\\f576";\n}\n\n.fa-arrows-to-circle::before {\n  content: "\\e4bd";\n}\n\n.fa-circle-chevron-right::before {\n  content: "\\f138";\n}\n\n.fa-chevron-circle-right::before {\n  content: "\\f138";\n}\n\n.fa-at::before {\n  content: "\\@";\n}\n\n.fa-trash-can::before {\n  content: "\\f2ed";\n}\n\n.fa-trash-alt::before {\n  content: "\\f2ed";\n}\n\n.fa-text-height::before {\n  content: "\\f034";\n}\n\n.fa-user-xmark::before {\n  content: "\\f235";\n}\n\n.fa-user-times::before {\n  content: "\\f235";\n}\n\n.fa-stethoscope::before {\n  content: "\\f0f1";\n}\n\n.fa-message::before {\n  content: "\\f27a";\n}\n\n.fa-comment-alt::before {\n  content: "\\f27a";\n}\n\n.fa-info::before {\n  content: "\\f129";\n}\n\n.fa-down-left-and-up-right-to-center::before {\n  content: "\\f422";\n}\n\n.fa-compress-alt::before {\n  content: "\\f422";\n}\n\n.fa-explosion::before {\n  content: "\\e4e9";\n}\n\n.fa-file-lines::before {\n  content: "\\f15c";\n}\n\n.fa-file-alt::before {\n  content: "\\f15c";\n}\n\n.fa-file-text::before {\n  content: "\\f15c";\n}\n\n.fa-wave-square::before {\n  content: "\\f83e";\n}\n\n.fa-ring::before {\n  content: "\\f70b";\n}\n\n.fa-building-un::before {\n  content: "\\e4d9";\n}\n\n.fa-dice-three::before {\n  content: "\\f527";\n}\n\n.fa-calendar-days::before {\n  content: "\\f073";\n}\n\n.fa-calendar-alt::before {\n  content: "\\f073";\n}\n\n.fa-anchor-circle-check::before {\n  content: "\\e4aa";\n}\n\n.fa-building-circle-arrow-right::before {\n  content: "\\e4d1";\n}\n\n.fa-volleyball::before {\n  content: "\\f45f";\n}\n\n.fa-volleyball-ball::before {\n  content: "\\f45f";\n}\n\n.fa-arrows-up-to-line::before {\n  content: "\\e4c2";\n}\n\n.fa-sort-down::before {\n  content: "\\f0dd";\n}\n\n.fa-sort-desc::before {\n  content: "\\f0dd";\n}\n\n.fa-circle-minus::before {\n  content: "\\f056";\n}\n\n.fa-minus-circle::before {\n  content: "\\f056";\n}\n\n.fa-door-open::before {\n  content: "\\f52b";\n}\n\n.fa-right-from-bracket::before {\n  content: "\\f2f5";\n}\n\n.fa-sign-out-alt::before {\n  content: "\\f2f5";\n}\n\n.fa-atom::before {\n  content: "\\f5d2";\n}\n\n.fa-soap::before {\n  content: "\\e06e";\n}\n\n.fa-icons::before {\n  content: "\\f86d";\n}\n\n.fa-heart-music-camera-bolt::before {\n  content: "\\f86d";\n}\n\n.fa-microphone-lines-slash::before {\n  content: "\\f539";\n}\n\n.fa-microphone-alt-slash::before {\n  content: "\\f539";\n}\n\n.fa-bridge-circle-check::before {\n  content: "\\e4c9";\n}\n\n.fa-pump-medical::before {\n  content: "\\e06a";\n}\n\n.fa-fingerprint::before {\n  content: "\\f577";\n}\n\n.fa-hand-point-right::before {\n  content: "\\f0a4";\n}\n\n.fa-magnifying-glass-location::before {\n  content: "\\f689";\n}\n\n.fa-search-location::before {\n  content: "\\f689";\n}\n\n.fa-forward-step::before {\n  content: "\\f051";\n}\n\n.fa-step-forward::before {\n  content: "\\f051";\n}\n\n.fa-face-smile-beam::before {\n  content: "\\f5b8";\n}\n\n.fa-smile-beam::before {\n  content: "\\f5b8";\n}\n\n.fa-flag-checkered::before {\n  content: "\\f11e";\n}\n\n.fa-football::before {\n  content: "\\f44e";\n}\n\n.fa-football-ball::before {\n  content: "\\f44e";\n}\n\n.fa-school-circle-exclamation::before {\n  content: "\\e56c";\n}\n\n.fa-crop::before {\n  content: "\\f125";\n}\n\n.fa-angles-down::before {\n  content: "\\f103";\n}\n\n.fa-angle-double-down::before {\n  content: "\\f103";\n}\n\n.fa-users-rectangle::before {\n  content: "\\e594";\n}\n\n.fa-people-roof::before {\n  content: "\\e537";\n}\n\n.fa-people-line::before {\n  content: "\\e534";\n}\n\n.fa-beer-mug-empty::before {\n  content: "\\f0fc";\n}\n\n.fa-beer::before {\n  content: "\\f0fc";\n}\n\n.fa-diagram-predecessor::before {\n  content: "\\e477";\n}\n\n.fa-arrow-up-long::before {\n  content: "\\f176";\n}\n\n.fa-long-arrow-up::before {\n  content: "\\f176";\n}\n\n.fa-fire-flame-simple::before {\n  content: "\\f46a";\n}\n\n.fa-burn::before {\n  content: "\\f46a";\n}\n\n.fa-person::before {\n  content: "\\f183";\n}\n\n.fa-male::before {\n  content: "\\f183";\n}\n\n.fa-laptop::before {\n  content: "\\f109";\n}\n\n.fa-file-csv::before {\n  content: "\\f6dd";\n}\n\n.fa-menorah::before {\n  content: "\\f676";\n}\n\n.fa-truck-plane::before {\n  content: "\\e58f";\n}\n\n.fa-record-vinyl::before {\n  content: "\\f8d9";\n}\n\n.fa-face-grin-stars::before {\n  content: "\\f587";\n}\n\n.fa-grin-stars::before {\n  content: "\\f587";\n}\n\n.fa-bong::before {\n  content: "\\f55c";\n}\n\n.fa-spaghetti-monster-flying::before {\n  content: "\\f67b";\n}\n\n.fa-pastafarianism::before {\n  content: "\\f67b";\n}\n\n.fa-arrow-down-up-across-line::before {\n  content: "\\e4af";\n}\n\n.fa-spoon::before {\n  content: "\\f2e5";\n}\n\n.fa-utensil-spoon::before {\n  content: "\\f2e5";\n}\n\n.fa-jar-wheat::before {\n  content: "\\e517";\n}\n\n.fa-envelopes-bulk::before {\n  content: "\\f674";\n}\n\n.fa-mail-bulk::before {\n  content: "\\f674";\n}\n\n.fa-file-circle-exclamation::before {\n  content: "\\e4eb";\n}\n\n.fa-circle-h::before {\n  content: "\\f47e";\n}\n\n.fa-hospital-symbol::before {\n  content: "\\f47e";\n}\n\n.fa-pager::before {\n  content: "\\f815";\n}\n\n.fa-address-book::before {\n  content: "\\f2b9";\n}\n\n.fa-contact-book::before {\n  content: "\\f2b9";\n}\n\n.fa-strikethrough::before {\n  content: "\\f0cc";\n}\n\n.fa-k::before {\n  content: "K";\n}\n\n.fa-landmark-flag::before {\n  content: "\\e51c";\n}\n\n.fa-pencil::before {\n  content: "\\f303";\n}\n\n.fa-pencil-alt::before {\n  content: "\\f303";\n}\n\n.fa-backward::before {\n  content: "\\f04a";\n}\n\n.fa-caret-right::before {\n  content: "\\f0da";\n}\n\n.fa-comments::before {\n  content: "\\f086";\n}\n\n.fa-paste::before {\n  content: "\\f0ea";\n}\n\n.fa-file-clipboard::before {\n  content: "\\f0ea";\n}\n\n.fa-code-pull-request::before {\n  content: "\\e13c";\n}\n\n.fa-clipboard-list::before {\n  content: "\\f46d";\n}\n\n.fa-truck-ramp-box::before {\n  content: "\\f4de";\n}\n\n.fa-truck-loading::before {\n  content: "\\f4de";\n}\n\n.fa-user-check::before {\n  content: "\\f4fc";\n}\n\n.fa-vial-virus::before {\n  content: "\\e597";\n}\n\n.fa-sheet-plastic::before {\n  content: "\\e571";\n}\n\n.fa-blog::before {\n  content: "\\f781";\n}\n\n.fa-user-ninja::before {\n  content: "\\f504";\n}\n\n.fa-person-arrow-up-from-line::before {\n  content: "\\e539";\n}\n\n.fa-scroll-torah::before {\n  content: "\\f6a0";\n}\n\n.fa-torah::before {\n  content: "\\f6a0";\n}\n\n.fa-broom-ball::before {\n  content: "\\f458";\n}\n\n.fa-quidditch::before {\n  content: "\\f458";\n}\n\n.fa-quidditch-broom-ball::before {\n  content: "\\f458";\n}\n\n.fa-toggle-off::before {\n  content: "\\f204";\n}\n\n.fa-box-archive::before {\n  content: "\\f187";\n}\n\n.fa-archive::before {\n  content: "\\f187";\n}\n\n.fa-person-drowning::before {\n  content: "\\e545";\n}\n\n.fa-arrow-down-9-1::before {\n  content: "\\f886";\n}\n\n.fa-sort-numeric-desc::before {\n  content: "\\f886";\n}\n\n.fa-sort-numeric-down-alt::before {\n  content: "\\f886";\n}\n\n.fa-face-grin-tongue-squint::before {\n  content: "\\f58a";\n}\n\n.fa-grin-tongue-squint::before {\n  content: "\\f58a";\n}\n\n.fa-spray-can::before {\n  content: "\\f5bd";\n}\n\n.fa-truck-monster::before {\n  content: "\\f63b";\n}\n\n.fa-w::before {\n  content: "W";\n}\n\n.fa-earth-africa::before {\n  content: "\\f57c";\n}\n\n.fa-globe-africa::before {\n  content: "\\f57c";\n}\n\n.fa-rainbow::before {\n  content: "\\f75b";\n}\n\n.fa-circle-notch::before {\n  content: "\\f1ce";\n}\n\n.fa-tablet-screen-button::before {\n  content: "\\f3fa";\n}\n\n.fa-tablet-alt::before {\n  content: "\\f3fa";\n}\n\n.fa-paw::before {\n  content: "\\f1b0";\n}\n\n.fa-cloud::before {\n  content: "\\f0c2";\n}\n\n.fa-trowel-bricks::before {\n  content: "\\e58a";\n}\n\n.fa-face-flushed::before {\n  content: "\\f579";\n}\n\n.fa-flushed::before {\n  content: "\\f579";\n}\n\n.fa-hospital-user::before {\n  content: "\\f80d";\n}\n\n.fa-tent-arrow-left-right::before {\n  content: "\\e57f";\n}\n\n.fa-gavel::before {\n  content: "\\f0e3";\n}\n\n.fa-legal::before {\n  content: "\\f0e3";\n}\n\n.fa-binoculars::before {\n  content: "\\f1e5";\n}\n\n.fa-microphone-slash::before {\n  content: "\\f131";\n}\n\n.fa-box-tissue::before {\n  content: "\\e05b";\n}\n\n.fa-motorcycle::before {\n  content: "\\f21c";\n}\n\n.fa-bell-concierge::before {\n  content: "\\f562";\n}\n\n.fa-concierge-bell::before {\n  content: "\\f562";\n}\n\n.fa-pen-ruler::before {\n  content: "\\f5ae";\n}\n\n.fa-pencil-ruler::before {\n  content: "\\f5ae";\n}\n\n.fa-people-arrows::before {\n  content: "\\e068";\n}\n\n.fa-people-arrows-left-right::before {\n  content: "\\e068";\n}\n\n.fa-mars-and-venus-burst::before {\n  content: "\\e523";\n}\n\n.fa-square-caret-right::before {\n  content: "\\f152";\n}\n\n.fa-caret-square-right::before {\n  content: "\\f152";\n}\n\n.fa-scissors::before {\n  content: "\\f0c4";\n}\n\n.fa-cut::before {\n  content: "\\f0c4";\n}\n\n.fa-sun-plant-wilt::before {\n  content: "\\e57a";\n}\n\n.fa-toilets-portable::before {\n  content: "\\e584";\n}\n\n.fa-hockey-puck::before {\n  content: "\\f453";\n}\n\n.fa-table::before {\n  content: "\\f0ce";\n}\n\n.fa-magnifying-glass-arrow-right::before {\n  content: "\\e521";\n}\n\n.fa-tachograph-digital::before {\n  content: "\\f566";\n}\n\n.fa-digital-tachograph::before {\n  content: "\\f566";\n}\n\n.fa-users-slash::before {\n  content: "\\e073";\n}\n\n.fa-clover::before {\n  content: "\\e139";\n}\n\n.fa-reply::before {\n  content: "\\f3e5";\n}\n\n.fa-mail-reply::before {\n  content: "\\f3e5";\n}\n\n.fa-star-and-crescent::before {\n  content: "\\f699";\n}\n\n.fa-house-fire::before {\n  content: "\\e50c";\n}\n\n.fa-square-minus::before {\n  content: "\\f146";\n}\n\n.fa-minus-square::before {\n  content: "\\f146";\n}\n\n.fa-helicopter::before {\n  content: "\\f533";\n}\n\n.fa-compass::before {\n  content: "\\f14e";\n}\n\n.fa-square-caret-down::before {\n  content: "\\f150";\n}\n\n.fa-caret-square-down::before {\n  content: "\\f150";\n}\n\n.fa-file-circle-question::before {\n  content: "\\e4ef";\n}\n\n.fa-laptop-code::before {\n  content: "\\f5fc";\n}\n\n.fa-swatchbook::before {\n  content: "\\f5c3";\n}\n\n.fa-prescription-bottle::before {\n  content: "\\f485";\n}\n\n.fa-bars::before {\n  content: "\\f0c9";\n}\n\n.fa-navicon::before {\n  content: "\\f0c9";\n}\n\n.fa-people-group::before {\n  content: "\\e533";\n}\n\n.fa-hourglass-end::before {\n  content: "\\f253";\n}\n\n.fa-hourglass-3::before {\n  content: "\\f253";\n}\n\n.fa-heart-crack::before {\n  content: "\\f7a9";\n}\n\n.fa-heart-broken::before {\n  content: "\\f7a9";\n}\n\n.fa-square-up-right::before {\n  content: "\\f360";\n}\n\n.fa-external-link-square-alt::before {\n  content: "\\f360";\n}\n\n.fa-face-kiss-beam::before {\n  content: "\\f597";\n}\n\n.fa-kiss-beam::before {\n  content: "\\f597";\n}\n\n.fa-film::before {\n  content: "\\f008";\n}\n\n.fa-ruler-horizontal::before {\n  content: "\\f547";\n}\n\n.fa-people-robbery::before {\n  content: "\\e536";\n}\n\n.fa-lightbulb::before {\n  content: "\\f0eb";\n}\n\n.fa-caret-left::before {\n  content: "\\f0d9";\n}\n\n.fa-circle-exclamation::before {\n  content: "\\f06a";\n}\n\n.fa-exclamation-circle::before {\n  content: "\\f06a";\n}\n\n.fa-school-circle-xmark::before {\n  content: "\\e56d";\n}\n\n.fa-arrow-right-from-bracket::before {\n  content: "\\f08b";\n}\n\n.fa-sign-out::before {\n  content: "\\f08b";\n}\n\n.fa-circle-chevron-down::before {\n  content: "\\f13a";\n}\n\n.fa-chevron-circle-down::before {\n  content: "\\f13a";\n}\n\n.fa-unlock-keyhole::before {\n  content: "\\f13e";\n}\n\n.fa-unlock-alt::before {\n  content: "\\f13e";\n}\n\n.fa-cloud-showers-heavy::before {\n  content: "\\f740";\n}\n\n.fa-headphones-simple::before {\n  content: "\\f58f";\n}\n\n.fa-headphones-alt::before {\n  content: "\\f58f";\n}\n\n.fa-sitemap::before {\n  content: "\\f0e8";\n}\n\n.fa-circle-dollar-to-slot::before {\n  content: "\\f4b9";\n}\n\n.fa-donate::before {\n  content: "\\f4b9";\n}\n\n.fa-memory::before {\n  content: "\\f538";\n}\n\n.fa-road-spikes::before {\n  content: "\\e568";\n}\n\n.fa-fire-burner::before {\n  content: "\\e4f1";\n}\n\n.fa-flag::before {\n  content: "\\f024";\n}\n\n.fa-hanukiah::before {\n  content: "\\f6e6";\n}\n\n.fa-feather::before {\n  content: "\\f52d";\n}\n\n.fa-volume-low::before {\n  content: "\\f027";\n}\n\n.fa-volume-down::before {\n  content: "\\f027";\n}\n\n.fa-comment-slash::before {\n  content: "\\f4b3";\n}\n\n.fa-cloud-sun-rain::before {\n  content: "\\f743";\n}\n\n.fa-compress::before {\n  content: "\\f066";\n}\n\n.fa-wheat-awn::before {\n  content: "\\e2cd";\n}\n\n.fa-wheat-alt::before {\n  content: "\\e2cd";\n}\n\n.fa-ankh::before {\n  content: "\\f644";\n}\n\n.fa-hands-holding-child::before {\n  content: "\\e4fa";\n}\n\n.fa-asterisk::before {\n  content: "\\*";\n}\n\n.fa-square-check::before {\n  content: "\\f14a";\n}\n\n.fa-check-square::before {\n  content: "\\f14a";\n}\n\n.fa-peseta-sign::before {\n  content: "\\e221";\n}\n\n.fa-heading::before {\n  content: "\\f1dc";\n}\n\n.fa-header::before {\n  content: "\\f1dc";\n}\n\n.fa-ghost::before {\n  content: "\\f6e2";\n}\n\n.fa-list::before {\n  content: "\\f03a";\n}\n\n.fa-list-squares::before {\n  content: "\\f03a";\n}\n\n.fa-square-phone-flip::before {\n  content: "\\f87b";\n}\n\n.fa-phone-square-alt::before {\n  content: "\\f87b";\n}\n\n.fa-cart-plus::before {\n  content: "\\f217";\n}\n\n.fa-gamepad::before {\n  content: "\\f11b";\n}\n\n.fa-circle-dot::before {\n  content: "\\f192";\n}\n\n.fa-dot-circle::before {\n  content: "\\f192";\n}\n\n.fa-face-dizzy::before {\n  content: "\\f567";\n}\n\n.fa-dizzy::before {\n  content: "\\f567";\n}\n\n.fa-egg::before {\n  content: "\\f7fb";\n}\n\n.fa-house-medical-circle-xmark::before {\n  content: "\\e513";\n}\n\n.fa-campground::before {\n  content: "\\f6bb";\n}\n\n.fa-folder-plus::before {\n  content: "\\f65e";\n}\n\n.fa-futbol::before {\n  content: "\\f1e3";\n}\n\n.fa-futbol-ball::before {\n  content: "\\f1e3";\n}\n\n.fa-soccer-ball::before {\n  content: "\\f1e3";\n}\n\n.fa-paintbrush::before {\n  content: "\\f1fc";\n}\n\n.fa-paint-brush::before {\n  content: "\\f1fc";\n}\n\n.fa-lock::before {\n  content: "\\f023";\n}\n\n.fa-gas-pump::before {\n  content: "\\f52f";\n}\n\n.fa-hot-tub-person::before {\n  content: "\\f593";\n}\n\n.fa-hot-tub::before {\n  content: "\\f593";\n}\n\n.fa-map-location::before {\n  content: "\\f59f";\n}\n\n.fa-map-marked::before {\n  content: "\\f59f";\n}\n\n.fa-house-flood-water::before {\n  content: "\\e50e";\n}\n\n.fa-tree::before {\n  content: "\\f1bb";\n}\n\n.fa-bridge-lock::before {\n  content: "\\e4cc";\n}\n\n.fa-sack-dollar::before {\n  content: "\\f81d";\n}\n\n.fa-pen-to-square::before {\n  content: "\\f044";\n}\n\n.fa-edit::before {\n  content: "\\f044";\n}\n\n.fa-car-side::before {\n  content: "\\f5e4";\n}\n\n.fa-share-nodes::before {\n  content: "\\f1e0";\n}\n\n.fa-share-alt::before {\n  content: "\\f1e0";\n}\n\n.fa-heart-circle-minus::before {\n  content: "\\e4ff";\n}\n\n.fa-hourglass-half::before {\n  content: "\\f252";\n}\n\n.fa-hourglass-2::before {\n  content: "\\f252";\n}\n\n.fa-microscope::before {\n  content: "\\f610";\n}\n\n.fa-sink::before {\n  content: "\\e06d";\n}\n\n.fa-bag-shopping::before {\n  content: "\\f290";\n}\n\n.fa-shopping-bag::before {\n  content: "\\f290";\n}\n\n.fa-arrow-down-z-a::before {\n  content: "\\f881";\n}\n\n.fa-sort-alpha-desc::before {\n  content: "\\f881";\n}\n\n.fa-sort-alpha-down-alt::before {\n  content: "\\f881";\n}\n\n.fa-mitten::before {\n  content: "\\f7b5";\n}\n\n.fa-person-rays::before {\n  content: "\\e54d";\n}\n\n.fa-users::before {\n  content: "\\f0c0";\n}\n\n.fa-eye-slash::before {\n  content: "\\f070";\n}\n\n.fa-flask-vial::before {\n  content: "\\e4f3";\n}\n\n.fa-hand::before {\n  content: "\\f256";\n}\n\n.fa-hand-paper::before {\n  content: "\\f256";\n}\n\n.fa-om::before {\n  content: "\\f679";\n}\n\n.fa-worm::before {\n  content: "\\e599";\n}\n\n.fa-house-circle-xmark::before {\n  content: "\\e50b";\n}\n\n.fa-plug::before {\n  content: "\\f1e6";\n}\n\n.fa-chevron-up::before {\n  content: "\\f077";\n}\n\n.fa-hand-spock::before {\n  content: "\\f259";\n}\n\n.fa-stopwatch::before {\n  content: "\\f2f2";\n}\n\n.fa-face-kiss::before {\n  content: "\\f596";\n}\n\n.fa-kiss::before {\n  content: "\\f596";\n}\n\n.fa-bridge-circle-xmark::before {\n  content: "\\e4cb";\n}\n\n.fa-face-grin-tongue::before {\n  content: "\\f589";\n}\n\n.fa-grin-tongue::before {\n  content: "\\f589";\n}\n\n.fa-chess-bishop::before {\n  content: "\\f43a";\n}\n\n.fa-face-grin-wink::before {\n  content: "\\f58c";\n}\n\n.fa-grin-wink::before {\n  content: "\\f58c";\n}\n\n.fa-ear-deaf::before {\n  content: "\\f2a4";\n}\n\n.fa-deaf::before {\n  content: "\\f2a4";\n}\n\n.fa-deafness::before {\n  content: "\\f2a4";\n}\n\n.fa-hard-of-hearing::before {\n  content: "\\f2a4";\n}\n\n.fa-road-circle-check::before {\n  content: "\\e564";\n}\n\n.fa-dice-five::before {\n  content: "\\f523";\n}\n\n.fa-square-rss::before {\n  content: "\\f143";\n}\n\n.fa-rss-square::before {\n  content: "\\f143";\n}\n\n.fa-land-mine-on::before {\n  content: "\\e51b";\n}\n\n.fa-i-cursor::before {\n  content: "\\f246";\n}\n\n.fa-stamp::before {\n  content: "\\f5bf";\n}\n\n.fa-stairs::before {\n  content: "\\e289";\n}\n\n.fa-i::before {\n  content: "I";\n}\n\n.fa-hryvnia-sign::before {\n  content: "\\f6f2";\n}\n\n.fa-hryvnia::before {\n  content: "\\f6f2";\n}\n\n.fa-pills::before {\n  content: "\\f484";\n}\n\n.fa-face-grin-wide::before {\n  content: "\\f581";\n}\n\n.fa-grin-alt::before {\n  content: "\\f581";\n}\n\n.fa-tooth::before {\n  content: "\\f5c9";\n}\n\n.fa-v::before {\n  content: "V";\n}\n\n.fa-bicycle::before {\n  content: "\\f206";\n}\n\n.fa-staff-snake::before {\n  content: "\\e579";\n}\n\n.fa-rod-asclepius::before {\n  content: "\\e579";\n}\n\n.fa-rod-snake::before {\n  content: "\\e579";\n}\n\n.fa-staff-aesculapius::before {\n  content: "\\e579";\n}\n\n.fa-head-side-cough-slash::before {\n  content: "\\e062";\n}\n\n.fa-truck-medical::before {\n  content: "\\f0f9";\n}\n\n.fa-ambulance::before {\n  content: "\\f0f9";\n}\n\n.fa-wheat-awn-circle-exclamation::before {\n  content: "\\e598";\n}\n\n.fa-snowman::before {\n  content: "\\f7d0";\n}\n\n.fa-mortar-pestle::before {\n  content: "\\f5a7";\n}\n\n.fa-road-barrier::before {\n  content: "\\e562";\n}\n\n.fa-school::before {\n  content: "\\f549";\n}\n\n.fa-igloo::before {\n  content: "\\f7ae";\n}\n\n.fa-joint::before {\n  content: "\\f595";\n}\n\n.fa-angle-right::before {\n  content: "\\f105";\n}\n\n.fa-horse::before {\n  content: "\\f6f0";\n}\n\n.fa-q::before {\n  content: "Q";\n}\n\n.fa-g::before {\n  content: "G";\n}\n\n.fa-notes-medical::before {\n  content: "\\f481";\n}\n\n.fa-temperature-half::before {\n  content: "\\f2c9";\n}\n\n.fa-temperature-2::before {\n  content: "\\f2c9";\n}\n\n.fa-thermometer-2::before {\n  content: "\\f2c9";\n}\n\n.fa-thermometer-half::before {\n  content: "\\f2c9";\n}\n\n.fa-dong-sign::before {\n  content: "\\e169";\n}\n\n.fa-capsules::before {\n  content: "\\f46b";\n}\n\n.fa-poo-storm::before {\n  content: "\\f75a";\n}\n\n.fa-poo-bolt::before {\n  content: "\\f75a";\n}\n\n.fa-face-frown-open::before {\n  content: "\\f57a";\n}\n\n.fa-frown-open::before {\n  content: "\\f57a";\n}\n\n.fa-hand-point-up::before {\n  content: "\\f0a6";\n}\n\n.fa-money-bill::before {\n  content: "\\f0d6";\n}\n\n.fa-bookmark::before {\n  content: "\\f02e";\n}\n\n.fa-align-justify::before {\n  content: "\\f039";\n}\n\n.fa-umbrella-beach::before {\n  content: "\\f5ca";\n}\n\n.fa-helmet-un::before {\n  content: "\\e503";\n}\n\n.fa-bullseye::before {\n  content: "\\f140";\n}\n\n.fa-bacon::before {\n  content: "\\f7e5";\n}\n\n.fa-hand-point-down::before {\n  content: "\\f0a7";\n}\n\n.fa-arrow-up-from-bracket::before {\n  content: "\\e09a";\n}\n\n.fa-folder::before {\n  content: "\\f07b";\n}\n\n.fa-folder-blank::before {\n  content: "\\f07b";\n}\n\n.fa-file-waveform::before {\n  content: "\\f478";\n}\n\n.fa-file-medical-alt::before {\n  content: "\\f478";\n}\n\n.fa-radiation::before {\n  content: "\\f7b9";\n}\n\n.fa-chart-simple::before {\n  content: "\\e473";\n}\n\n.fa-mars-stroke::before {\n  content: "\\f229";\n}\n\n.fa-vial::before {\n  content: "\\f492";\n}\n\n.fa-gauge::before {\n  content: "\\f624";\n}\n\n.fa-dashboard::before {\n  content: "\\f624";\n}\n\n.fa-gauge-med::before {\n  content: "\\f624";\n}\n\n.fa-tachometer-alt-average::before {\n  content: "\\f624";\n}\n\n.fa-wand-magic-sparkles::before {\n  content: "\\e2ca";\n}\n\n.fa-magic-wand-sparkles::before {\n  content: "\\e2ca";\n}\n\n.fa-e::before {\n  content: "E";\n}\n\n.fa-pen-clip::before {\n  content: "\\f305";\n}\n\n.fa-pen-alt::before {\n  content: "\\f305";\n}\n\n.fa-bridge-circle-exclamation::before {\n  content: "\\e4ca";\n}\n\n.fa-user::before {\n  content: "\\f007";\n}\n\n.fa-school-circle-check::before {\n  content: "\\e56b";\n}\n\n.fa-dumpster::before {\n  content: "\\f793";\n}\n\n.fa-van-shuttle::before {\n  content: "\\f5b6";\n}\n\n.fa-shuttle-van::before {\n  content: "\\f5b6";\n}\n\n.fa-building-user::before {\n  content: "\\e4da";\n}\n\n.fa-square-caret-left::before {\n  content: "\\f191";\n}\n\n.fa-caret-square-left::before {\n  content: "\\f191";\n}\n\n.fa-highlighter::before {\n  content: "\\f591";\n}\n\n.fa-key::before {\n  content: "\\f084";\n}\n\n.fa-bullhorn::before {\n  content: "\\f0a1";\n}\n\n.fa-globe::before {\n  content: "\\f0ac";\n}\n\n.fa-synagogue::before {\n  content: "\\f69b";\n}\n\n.fa-person-half-dress::before {\n  content: "\\e548";\n}\n\n.fa-road-bridge::before {\n  content: "\\e563";\n}\n\n.fa-location-arrow::before {\n  content: "\\f124";\n}\n\n.fa-c::before {\n  content: "C";\n}\n\n.fa-tablet-button::before {\n  content: "\\f10a";\n}\n\n.fa-building-lock::before {\n  content: "\\e4d6";\n}\n\n.fa-pizza-slice::before {\n  content: "\\f818";\n}\n\n.fa-money-bill-wave::before {\n  content: "\\f53a";\n}\n\n.fa-chart-area::before {\n  content: "\\f1fe";\n}\n\n.fa-area-chart::before {\n  content: "\\f1fe";\n}\n\n.fa-house-flag::before {\n  content: "\\e50d";\n}\n\n.fa-person-circle-minus::before {\n  content: "\\e540";\n}\n\n.fa-ban::before {\n  content: "\\f05e";\n}\n\n.fa-cancel::before {\n  content: "\\f05e";\n}\n\n.fa-camera-rotate::before {\n  content: "\\e0d8";\n}\n\n.fa-spray-can-sparkles::before {\n  content: "\\f5d0";\n}\n\n.fa-air-freshener::before {\n  content: "\\f5d0";\n}\n\n.fa-star::before {\n  content: "\\f005";\n}\n\n.fa-repeat::before {\n  content: "\\f363";\n}\n\n.fa-cross::before {\n  content: "\\f654";\n}\n\n.fa-box::before {\n  content: "\\f466";\n}\n\n.fa-venus-mars::before {\n  content: "\\f228";\n}\n\n.fa-arrow-pointer::before {\n  content: "\\f245";\n}\n\n.fa-mouse-pointer::before {\n  content: "\\f245";\n}\n\n.fa-maximize::before {\n  content: "\\f31e";\n}\n\n.fa-expand-arrows-alt::before {\n  content: "\\f31e";\n}\n\n.fa-charging-station::before {\n  content: "\\f5e7";\n}\n\n.fa-shapes::before {\n  content: "\\f61f";\n}\n\n.fa-triangle-circle-square::before {\n  content: "\\f61f";\n}\n\n.fa-shuffle::before {\n  content: "\\f074";\n}\n\n.fa-random::before {\n  content: "\\f074";\n}\n\n.fa-person-running::before {\n  content: "\\f70c";\n}\n\n.fa-running::before {\n  content: "\\f70c";\n}\n\n.fa-mobile-retro::before {\n  content: "\\e527";\n}\n\n.fa-grip-lines-vertical::before {\n  content: "\\f7a5";\n}\n\n.fa-spider::before {\n  content: "\\f717";\n}\n\n.fa-hands-bound::before {\n  content: "\\e4f9";\n}\n\n.fa-file-invoice-dollar::before {\n  content: "\\f571";\n}\n\n.fa-plane-circle-exclamation::before {\n  content: "\\e556";\n}\n\n.fa-x-ray::before {\n  content: "\\f497";\n}\n\n.fa-spell-check::before {\n  content: "\\f891";\n}\n\n.fa-slash::before {\n  content: "\\f715";\n}\n\n.fa-computer-mouse::before {\n  content: "\\f8cc";\n}\n\n.fa-mouse::before {\n  content: "\\f8cc";\n}\n\n.fa-arrow-right-to-bracket::before {\n  content: "\\f090";\n}\n\n.fa-sign-in::before {\n  content: "\\f090";\n}\n\n.fa-shop-slash::before {\n  content: "\\e070";\n}\n\n.fa-store-alt-slash::before {\n  content: "\\e070";\n}\n\n.fa-server::before {\n  content: "\\f233";\n}\n\n.fa-virus-covid-slash::before {\n  content: "\\e4a9";\n}\n\n.fa-shop-lock::before {\n  content: "\\e4a5";\n}\n\n.fa-hourglass-start::before {\n  content: "\\f251";\n}\n\n.fa-hourglass-1::before {\n  content: "\\f251";\n}\n\n.fa-blender-phone::before {\n  content: "\\f6b6";\n}\n\n.fa-building-wheat::before {\n  content: "\\e4db";\n}\n\n.fa-person-breastfeeding::before {\n  content: "\\e53a";\n}\n\n.fa-right-to-bracket::before {\n  content: "\\f2f6";\n}\n\n.fa-sign-in-alt::before {\n  content: "\\f2f6";\n}\n\n.fa-venus::before {\n  content: "\\f221";\n}\n\n.fa-passport::before {\n  content: "\\f5ab";\n}\n\n.fa-heart-pulse::before {\n  content: "\\f21e";\n}\n\n.fa-heartbeat::before {\n  content: "\\f21e";\n}\n\n.fa-people-carry-box::before {\n  content: "\\f4ce";\n}\n\n.fa-people-carry::before {\n  content: "\\f4ce";\n}\n\n.fa-temperature-high::before {\n  content: "\\f769";\n}\n\n.fa-microchip::before {\n  content: "\\f2db";\n}\n\n.fa-crown::before {\n  content: "\\f521";\n}\n\n.fa-weight-hanging::before {\n  content: "\\f5cd";\n}\n\n.fa-xmarks-lines::before {\n  content: "\\e59a";\n}\n\n.fa-file-prescription::before {\n  content: "\\f572";\n}\n\n.fa-weight-scale::before {\n  content: "\\f496";\n}\n\n.fa-weight::before {\n  content: "\\f496";\n}\n\n.fa-user-group::before {\n  content: "\\f500";\n}\n\n.fa-user-friends::before {\n  content: "\\f500";\n}\n\n.fa-arrow-up-a-z::before {\n  content: "\\f15e";\n}\n\n.fa-sort-alpha-up::before {\n  content: "\\f15e";\n}\n\n.fa-chess-knight::before {\n  content: "\\f441";\n}\n\n.fa-face-laugh-squint::before {\n  content: "\\f59b";\n}\n\n.fa-laugh-squint::before {\n  content: "\\f59b";\n}\n\n.fa-wheelchair::before {\n  content: "\\f193";\n}\n\n.fa-circle-arrow-up::before {\n  content: "\\f0aa";\n}\n\n.fa-arrow-circle-up::before {\n  content: "\\f0aa";\n}\n\n.fa-toggle-on::before {\n  content: "\\f205";\n}\n\n.fa-person-walking::before {\n  content: "\\f554";\n}\n\n.fa-walking::before {\n  content: "\\f554";\n}\n\n.fa-l::before {\n  content: "L";\n}\n\n.fa-fire::before {\n  content: "\\f06d";\n}\n\n.fa-bed-pulse::before {\n  content: "\\f487";\n}\n\n.fa-procedures::before {\n  content: "\\f487";\n}\n\n.fa-shuttle-space::before {\n  content: "\\f197";\n}\n\n.fa-space-shuttle::before {\n  content: "\\f197";\n}\n\n.fa-face-laugh::before {\n  content: "\\f599";\n}\n\n.fa-laugh::before {\n  content: "\\f599";\n}\n\n.fa-folder-open::before {\n  content: "\\f07c";\n}\n\n.fa-heart-circle-plus::before {\n  content: "\\e500";\n}\n\n.fa-code-fork::before {\n  content: "\\e13b";\n}\n\n.fa-city::before {\n  content: "\\f64f";\n}\n\n.fa-microphone-lines::before {\n  content: "\\f3c9";\n}\n\n.fa-microphone-alt::before {\n  content: "\\f3c9";\n}\n\n.fa-pepper-hot::before {\n  content: "\\f816";\n}\n\n.fa-unlock::before {\n  content: "\\f09c";\n}\n\n.fa-colon-sign::before {\n  content: "\\e140";\n}\n\n.fa-headset::before {\n  content: "\\f590";\n}\n\n.fa-store-slash::before {\n  content: "\\e071";\n}\n\n.fa-road-circle-xmark::before {\n  content: "\\e566";\n}\n\n.fa-user-minus::before {\n  content: "\\f503";\n}\n\n.fa-mars-stroke-up::before {\n  content: "\\f22a";\n}\n\n.fa-mars-stroke-v::before {\n  content: "\\f22a";\n}\n\n.fa-champagne-glasses::before {\n  content: "\\f79f";\n}\n\n.fa-glass-cheers::before {\n  content: "\\f79f";\n}\n\n.fa-clipboard::before {\n  content: "\\f328";\n}\n\n.fa-house-circle-exclamation::before {\n  content: "\\e50a";\n}\n\n.fa-file-arrow-up::before {\n  content: "\\f574";\n}\n\n.fa-file-upload::before {\n  content: "\\f574";\n}\n\n.fa-wifi::before {\n  content: "\\f1eb";\n}\n\n.fa-wifi-3::before {\n  content: "\\f1eb";\n}\n\n.fa-wifi-strong::before {\n  content: "\\f1eb";\n}\n\n.fa-bath::before {\n  content: "\\f2cd";\n}\n\n.fa-bathtub::before {\n  content: "\\f2cd";\n}\n\n.fa-underline::before {\n  content: "\\f0cd";\n}\n\n.fa-user-pen::before {\n  content: "\\f4ff";\n}\n\n.fa-user-edit::before {\n  content: "\\f4ff";\n}\n\n.fa-signature::before {\n  content: "\\f5b7";\n}\n\n.fa-stroopwafel::before {\n  content: "\\f551";\n}\n\n.fa-bold::before {\n  content: "\\f032";\n}\n\n.fa-anchor-lock::before {\n  content: "\\e4ad";\n}\n\n.fa-building-ngo::before {\n  content: "\\e4d7";\n}\n\n.fa-manat-sign::before {\n  content: "\\e1d5";\n}\n\n.fa-not-equal::before {\n  content: "\\f53e";\n}\n\n.fa-border-top-left::before {\n  content: "\\f853";\n}\n\n.fa-border-style::before {\n  content: "\\f853";\n}\n\n.fa-map-location-dot::before {\n  content: "\\f5a0";\n}\n\n.fa-map-marked-alt::before {\n  content: "\\f5a0";\n}\n\n.fa-jedi::before {\n  content: "\\f669";\n}\n\n.fa-square-poll-vertical::before {\n  content: "\\f681";\n}\n\n.fa-poll::before {\n  content: "\\f681";\n}\n\n.fa-mug-hot::before {\n  content: "\\f7b6";\n}\n\n.fa-car-battery::before {\n  content: "\\f5df";\n}\n\n.fa-battery-car::before {\n  content: "\\f5df";\n}\n\n.fa-gift::before {\n  content: "\\f06b";\n}\n\n.fa-dice-two::before {\n  content: "\\f528";\n}\n\n.fa-chess-queen::before {\n  content: "\\f445";\n}\n\n.fa-glasses::before {\n  content: "\\f530";\n}\n\n.fa-chess-board::before {\n  content: "\\f43c";\n}\n\n.fa-building-circle-check::before {\n  content: "\\e4d2";\n}\n\n.fa-person-chalkboard::before {\n  content: "\\e53d";\n}\n\n.fa-mars-stroke-right::before {\n  content: "\\f22b";\n}\n\n.fa-mars-stroke-h::before {\n  content: "\\f22b";\n}\n\n.fa-hand-back-fist::before {\n  content: "\\f255";\n}\n\n.fa-hand-rock::before {\n  content: "\\f255";\n}\n\n.fa-square-caret-up::before {\n  content: "\\f151";\n}\n\n.fa-caret-square-up::before {\n  content: "\\f151";\n}\n\n.fa-cloud-showers-water::before {\n  content: "\\e4e4";\n}\n\n.fa-chart-bar::before {\n  content: "\\f080";\n}\n\n.fa-bar-chart::before {\n  content: "\\f080";\n}\n\n.fa-hands-bubbles::before {\n  content: "\\e05e";\n}\n\n.fa-hands-wash::before {\n  content: "\\e05e";\n}\n\n.fa-less-than-equal::before {\n  content: "\\f537";\n}\n\n.fa-train::before {\n  content: "\\f238";\n}\n\n.fa-eye-low-vision::before {\n  content: "\\f2a8";\n}\n\n.fa-low-vision::before {\n  content: "\\f2a8";\n}\n\n.fa-crow::before {\n  content: "\\f520";\n}\n\n.fa-sailboat::before {\n  content: "\\e445";\n}\n\n.fa-window-restore::before {\n  content: "\\f2d2";\n}\n\n.fa-square-plus::before {\n  content: "\\f0fe";\n}\n\n.fa-plus-square::before {\n  content: "\\f0fe";\n}\n\n.fa-torii-gate::before {\n  content: "\\f6a1";\n}\n\n.fa-frog::before {\n  content: "\\f52e";\n}\n\n.fa-bucket::before {\n  content: "\\e4cf";\n}\n\n.fa-image::before {\n  content: "\\f03e";\n}\n\n.fa-microphone::before {\n  content: "\\f130";\n}\n\n.fa-cow::before {\n  content: "\\f6c8";\n}\n\n.fa-caret-up::before {\n  content: "\\f0d8";\n}\n\n.fa-screwdriver::before {\n  content: "\\f54a";\n}\n\n.fa-folder-closed::before {\n  content: "\\e185";\n}\n\n.fa-house-tsunami::before {\n  content: "\\e515";\n}\n\n.fa-square-nfi::before {\n  content: "\\e576";\n}\n\n.fa-arrow-up-from-ground-water::before {\n  content: "\\e4b5";\n}\n\n.fa-martini-glass::before {\n  content: "\\f57b";\n}\n\n.fa-glass-martini-alt::before {\n  content: "\\f57b";\n}\n\n.fa-rotate-left::before {\n  content: "\\f2ea";\n}\n\n.fa-rotate-back::before {\n  content: "\\f2ea";\n}\n\n.fa-rotate-backward::before {\n  content: "\\f2ea";\n}\n\n.fa-undo-alt::before {\n  content: "\\f2ea";\n}\n\n.fa-table-columns::before {\n  content: "\\f0db";\n}\n\n.fa-columns::before {\n  content: "\\f0db";\n}\n\n.fa-lemon::before {\n  content: "\\f094";\n}\n\n.fa-head-side-mask::before {\n  content: "\\e063";\n}\n\n.fa-handshake::before {\n  content: "\\f2b5";\n}\n\n.fa-gem::before {\n  content: "\\f3a5";\n}\n\n.fa-dolly::before {\n  content: "\\f472";\n}\n\n.fa-dolly-box::before {\n  content: "\\f472";\n}\n\n.fa-smoking::before {\n  content: "\\f48d";\n}\n\n.fa-minimize::before {\n  content: "\\f78c";\n}\n\n.fa-compress-arrows-alt::before {\n  content: "\\f78c";\n}\n\n.fa-monument::before {\n  content: "\\f5a6";\n}\n\n.fa-snowplow::before {\n  content: "\\f7d2";\n}\n\n.fa-angles-right::before {\n  content: "\\f101";\n}\n\n.fa-angle-double-right::before {\n  content: "\\f101";\n}\n\n.fa-cannabis::before {\n  content: "\\f55f";\n}\n\n.fa-circle-play::before {\n  content: "\\f144";\n}\n\n.fa-play-circle::before {\n  content: "\\f144";\n}\n\n.fa-tablets::before {\n  content: "\\f490";\n}\n\n.fa-ethernet::before {\n  content: "\\f796";\n}\n\n.fa-euro-sign::before {\n  content: "\\f153";\n}\n\n.fa-eur::before {\n  content: "\\f153";\n}\n\n.fa-euro::before {\n  content: "\\f153";\n}\n\n.fa-chair::before {\n  content: "\\f6c0";\n}\n\n.fa-circle-check::before {\n  content: "\\f058";\n}\n\n.fa-check-circle::before {\n  content: "\\f058";\n}\n\n.fa-circle-stop::before {\n  content: "\\f28d";\n}\n\n.fa-stop-circle::before {\n  content: "\\f28d";\n}\n\n.fa-compass-drafting::before {\n  content: "\\f568";\n}\n\n.fa-drafting-compass::before {\n  content: "\\f568";\n}\n\n.fa-plate-wheat::before {\n  content: "\\e55a";\n}\n\n.fa-icicles::before {\n  content: "\\f7ad";\n}\n\n.fa-person-shelter::before {\n  content: "\\e54f";\n}\n\n.fa-neuter::before {\n  content: "\\f22c";\n}\n\n.fa-id-badge::before {\n  content: "\\f2c1";\n}\n\n.fa-marker::before {\n  content: "\\f5a1";\n}\n\n.fa-face-laugh-beam::before {\n  content: "\\f59a";\n}\n\n.fa-laugh-beam::before {\n  content: "\\f59a";\n}\n\n.fa-helicopter-symbol::before {\n  content: "\\e502";\n}\n\n.fa-universal-access::before {\n  content: "\\f29a";\n}\n\n.fa-circle-chevron-up::before {\n  content: "\\f139";\n}\n\n.fa-chevron-circle-up::before {\n  content: "\\f139";\n}\n\n.fa-lari-sign::before {\n  content: "\\e1c8";\n}\n\n.fa-volcano::before {\n  content: "\\f770";\n}\n\n.fa-person-walking-dashed-line-arrow-right::before {\n  content: "\\e553";\n}\n\n.fa-sterling-sign::before {\n  content: "\\f154";\n}\n\n.fa-gbp::before {\n  content: "\\f154";\n}\n\n.fa-pound-sign::before {\n  content: "\\f154";\n}\n\n.fa-viruses::before {\n  content: "\\e076";\n}\n\n.fa-square-person-confined::before {\n  content: "\\e577";\n}\n\n.fa-user-tie::before {\n  content: "\\f508";\n}\n\n.fa-arrow-down-long::before {\n  content: "\\f175";\n}\n\n.fa-long-arrow-down::before {\n  content: "\\f175";\n}\n\n.fa-tent-arrow-down-to-line::before {\n  content: "\\e57e";\n}\n\n.fa-certificate::before {\n  content: "\\f0a3";\n}\n\n.fa-reply-all::before {\n  content: "\\f122";\n}\n\n.fa-mail-reply-all::before {\n  content: "\\f122";\n}\n\n.fa-suitcase::before {\n  content: "\\f0f2";\n}\n\n.fa-person-skating::before {\n  content: "\\f7c5";\n}\n\n.fa-skating::before {\n  content: "\\f7c5";\n}\n\n.fa-filter-circle-dollar::before {\n  content: "\\f662";\n}\n\n.fa-funnel-dollar::before {\n  content: "\\f662";\n}\n\n.fa-camera-retro::before {\n  content: "\\f083";\n}\n\n.fa-circle-arrow-down::before {\n  content: "\\f0ab";\n}\n\n.fa-arrow-circle-down::before {\n  content: "\\f0ab";\n}\n\n.fa-file-import::before {\n  content: "\\f56f";\n}\n\n.fa-arrow-right-to-file::before {\n  content: "\\f56f";\n}\n\n.fa-square-arrow-up-right::before {\n  content: "\\f14c";\n}\n\n.fa-external-link-square::before {\n  content: "\\f14c";\n}\n\n.fa-box-open::before {\n  content: "\\f49e";\n}\n\n.fa-scroll::before {\n  content: "\\f70e";\n}\n\n.fa-spa::before {\n  content: "\\f5bb";\n}\n\n.fa-location-pin-lock::before {\n  content: "\\e51f";\n}\n\n.fa-pause::before {\n  content: "\\f04c";\n}\n\n.fa-hill-avalanche::before {\n  content: "\\e507";\n}\n\n.fa-temperature-empty::before {\n  content: "\\f2cb";\n}\n\n.fa-temperature-0::before {\n  content: "\\f2cb";\n}\n\n.fa-thermometer-0::before {\n  content: "\\f2cb";\n}\n\n.fa-thermometer-empty::before {\n  content: "\\f2cb";\n}\n\n.fa-bomb::before {\n  content: "\\f1e2";\n}\n\n.fa-registered::before {\n  content: "\\f25d";\n}\n\n.fa-address-card::before {\n  content: "\\f2bb";\n}\n\n.fa-contact-card::before {\n  content: "\\f2bb";\n}\n\n.fa-vcard::before {\n  content: "\\f2bb";\n}\n\n.fa-scale-unbalanced-flip::before {\n  content: "\\f516";\n}\n\n.fa-balance-scale-right::before {\n  content: "\\f516";\n}\n\n.fa-subscript::before {\n  content: "\\f12c";\n}\n\n.fa-diamond-turn-right::before {\n  content: "\\f5eb";\n}\n\n.fa-directions::before {\n  content: "\\f5eb";\n}\n\n.fa-burst::before {\n  content: "\\e4dc";\n}\n\n.fa-house-laptop::before {\n  content: "\\e066";\n}\n\n.fa-laptop-house::before {\n  content: "\\e066";\n}\n\n.fa-face-tired::before {\n  content: "\\f5c8";\n}\n\n.fa-tired::before {\n  content: "\\f5c8";\n}\n\n.fa-money-bills::before {\n  content: "\\e1f3";\n}\n\n.fa-smog::before {\n  content: "\\f75f";\n}\n\n.fa-crutch::before {\n  content: "\\f7f7";\n}\n\n.fa-cloud-arrow-up::before {\n  content: "\\f0ee";\n}\n\n.fa-cloud-upload::before {\n  content: "\\f0ee";\n}\n\n.fa-cloud-upload-alt::before {\n  content: "\\f0ee";\n}\n\n.fa-palette::before {\n  content: "\\f53f";\n}\n\n.fa-arrows-turn-right::before {\n  content: "\\e4c0";\n}\n\n.fa-vest::before {\n  content: "\\e085";\n}\n\n.fa-ferry::before {\n  content: "\\e4ea";\n}\n\n.fa-arrows-down-to-people::before {\n  content: "\\e4b9";\n}\n\n.fa-seedling::before {\n  content: "\\f4d8";\n}\n\n.fa-sprout::before {\n  content: "\\f4d8";\n}\n\n.fa-left-right::before {\n  content: "\\f337";\n}\n\n.fa-arrows-alt-h::before {\n  content: "\\f337";\n}\n\n.fa-boxes-packing::before {\n  content: "\\e4c7";\n}\n\n.fa-circle-arrow-left::before {\n  content: "\\f0a8";\n}\n\n.fa-arrow-circle-left::before {\n  content: "\\f0a8";\n}\n\n.fa-group-arrows-rotate::before {\n  content: "\\e4f6";\n}\n\n.fa-bowl-food::before {\n  content: "\\e4c6";\n}\n\n.fa-candy-cane::before {\n  content: "\\f786";\n}\n\n.fa-arrow-down-wide-short::before {\n  content: "\\f160";\n}\n\n.fa-sort-amount-asc::before {\n  content: "\\f160";\n}\n\n.fa-sort-amount-down::before {\n  content: "\\f160";\n}\n\n.fa-cloud-bolt::before {\n  content: "\\f76c";\n}\n\n.fa-thunderstorm::before {\n  content: "\\f76c";\n}\n\n.fa-text-slash::before {\n  content: "\\f87d";\n}\n\n.fa-remove-format::before {\n  content: "\\f87d";\n}\n\n.fa-face-smile-wink::before {\n  content: "\\f4da";\n}\n\n.fa-smile-wink::before {\n  content: "\\f4da";\n}\n\n.fa-file-word::before {\n  content: "\\f1c2";\n}\n\n.fa-file-powerpoint::before {\n  content: "\\f1c4";\n}\n\n.fa-arrows-left-right::before {\n  content: "\\f07e";\n}\n\n.fa-arrows-h::before {\n  content: "\\f07e";\n}\n\n.fa-house-lock::before {\n  content: "\\e510";\n}\n\n.fa-cloud-arrow-down::before {\n  content: "\\f0ed";\n}\n\n.fa-cloud-download::before {\n  content: "\\f0ed";\n}\n\n.fa-cloud-download-alt::before {\n  content: "\\f0ed";\n}\n\n.fa-children::before {\n  content: "\\e4e1";\n}\n\n.fa-chalkboard::before {\n  content: "\\f51b";\n}\n\n.fa-blackboard::before {\n  content: "\\f51b";\n}\n\n.fa-user-large-slash::before {\n  content: "\\f4fa";\n}\n\n.fa-user-alt-slash::before {\n  content: "\\f4fa";\n}\n\n.fa-envelope-open::before {\n  content: "\\f2b6";\n}\n\n.fa-handshake-simple-slash::before {\n  content: "\\e05f";\n}\n\n.fa-handshake-alt-slash::before {\n  content: "\\e05f";\n}\n\n.fa-mattress-pillow::before {\n  content: "\\e525";\n}\n\n.fa-guarani-sign::before {\n  content: "\\e19a";\n}\n\n.fa-arrows-rotate::before {\n  content: "\\f021";\n}\n\n.fa-refresh::before {\n  content: "\\f021";\n}\n\n.fa-sync::before {\n  content: "\\f021";\n}\n\n.fa-fire-extinguisher::before {\n  content: "\\f134";\n}\n\n.fa-cruzeiro-sign::before {\n  content: "\\e152";\n}\n\n.fa-greater-than-equal::before {\n  content: "\\f532";\n}\n\n.fa-shield-halved::before {\n  content: "\\f3ed";\n}\n\n.fa-shield-alt::before {\n  content: "\\f3ed";\n}\n\n.fa-book-atlas::before {\n  content: "\\f558";\n}\n\n.fa-atlas::before {\n  content: "\\f558";\n}\n\n.fa-virus::before {\n  content: "\\e074";\n}\n\n.fa-envelope-circle-check::before {\n  content: "\\e4e8";\n}\n\n.fa-layer-group::before {\n  content: "\\f5fd";\n}\n\n.fa-arrows-to-dot::before {\n  content: "\\e4be";\n}\n\n.fa-archway::before {\n  content: "\\f557";\n}\n\n.fa-heart-circle-check::before {\n  content: "\\e4fd";\n}\n\n.fa-house-chimney-crack::before {\n  content: "\\f6f1";\n}\n\n.fa-house-damage::before {\n  content: "\\f6f1";\n}\n\n.fa-file-zipper::before {\n  content: "\\f1c6";\n}\n\n.fa-file-archive::before {\n  content: "\\f1c6";\n}\n\n.fa-square::before {\n  content: "\\f0c8";\n}\n\n.fa-martini-glass-empty::before {\n  content: "\\f000";\n}\n\n.fa-glass-martini::before {\n  content: "\\f000";\n}\n\n.fa-couch::before {\n  content: "\\f4b8";\n}\n\n.fa-cedi-sign::before {\n  content: "\\e0df";\n}\n\n.fa-italic::before {\n  content: "\\f033";\n}\n\n.fa-church::before {\n  content: "\\f51d";\n}\n\n.fa-comments-dollar::before {\n  content: "\\f653";\n}\n\n.fa-democrat::before {\n  content: "\\f747";\n}\n\n.fa-z::before {\n  content: "Z";\n}\n\n.fa-person-skiing::before {\n  content: "\\f7c9";\n}\n\n.fa-skiing::before {\n  content: "\\f7c9";\n}\n\n.fa-road-lock::before {\n  content: "\\e567";\n}\n\n.fa-a::before {\n  content: "A";\n}\n\n.fa-temperature-arrow-down::before {\n  content: "\\e03f";\n}\n\n.fa-temperature-down::before {\n  content: "\\e03f";\n}\n\n.fa-feather-pointed::before {\n  content: "\\f56b";\n}\n\n.fa-feather-alt::before {\n  content: "\\f56b";\n}\n\n.fa-p::before {\n  content: "P";\n}\n\n.fa-snowflake::before {\n  content: "\\f2dc";\n}\n\n.fa-newspaper::before {\n  content: "\\f1ea";\n}\n\n.fa-rectangle-ad::before {\n  content: "\\f641";\n}\n\n.fa-ad::before {\n  content: "\\f641";\n}\n\n.fa-circle-arrow-right::before {\n  content: "\\f0a9";\n}\n\n.fa-arrow-circle-right::before {\n  content: "\\f0a9";\n}\n\n.fa-filter-circle-xmark::before {\n  content: "\\e17b";\n}\n\n.fa-locust::before {\n  content: "\\e520";\n}\n\n.fa-sort::before {\n  content: "\\f0dc";\n}\n\n.fa-unsorted::before {\n  content: "\\f0dc";\n}\n\n.fa-list-ol::before {\n  content: "\\f0cb";\n}\n\n.fa-list-1-2::before {\n  content: "\\f0cb";\n}\n\n.fa-list-numeric::before {\n  content: "\\f0cb";\n}\n\n.fa-person-dress-burst::before {\n  content: "\\e544";\n}\n\n.fa-money-check-dollar::before {\n  content: "\\f53d";\n}\n\n.fa-money-check-alt::before {\n  content: "\\f53d";\n}\n\n.fa-vector-square::before {\n  content: "\\f5cb";\n}\n\n.fa-bread-slice::before {\n  content: "\\f7ec";\n}\n\n.fa-language::before {\n  content: "\\f1ab";\n}\n\n.fa-face-kiss-wink-heart::before {\n  content: "\\f598";\n}\n\n.fa-kiss-wink-heart::before {\n  content: "\\f598";\n}\n\n.fa-filter::before {\n  content: "\\f0b0";\n}\n\n.fa-question::before {\n  content: "\\?";\n}\n\n.fa-file-signature::before {\n  content: "\\f573";\n}\n\n.fa-up-down-left-right::before {\n  content: "\\f0b2";\n}\n\n.fa-arrows-alt::before {\n  content: "\\f0b2";\n}\n\n.fa-house-chimney-user::before {\n  content: "\\e065";\n}\n\n.fa-hand-holding-heart::before {\n  content: "\\f4be";\n}\n\n.fa-puzzle-piece::before {\n  content: "\\f12e";\n}\n\n.fa-money-check::before {\n  content: "\\f53c";\n}\n\n.fa-star-half-stroke::before {\n  content: "\\f5c0";\n}\n\n.fa-star-half-alt::before {\n  content: "\\f5c0";\n}\n\n.fa-code::before {\n  content: "\\f121";\n}\n\n.fa-whiskey-glass::before {\n  content: "\\f7a0";\n}\n\n.fa-glass-whiskey::before {\n  content: "\\f7a0";\n}\n\n.fa-building-circle-exclamation::before {\n  content: "\\e4d3";\n}\n\n.fa-magnifying-glass-chart::before {\n  content: "\\e522";\n}\n\n.fa-arrow-up-right-from-square::before {\n  content: "\\f08e";\n}\n\n.fa-external-link::before {\n  content: "\\f08e";\n}\n\n.fa-cubes-stacked::before {\n  content: "\\e4e6";\n}\n\n.fa-won-sign::before {\n  content: "\\f159";\n}\n\n.fa-krw::before {\n  content: "\\f159";\n}\n\n.fa-won::before {\n  content: "\\f159";\n}\n\n.fa-virus-covid::before {\n  content: "\\e4a8";\n}\n\n.fa-austral-sign::before {\n  content: "\\e0a9";\n}\n\n.fa-f::before {\n  content: "F";\n}\n\n.fa-leaf::before {\n  content: "\\f06c";\n}\n\n.fa-road::before {\n  content: "\\f018";\n}\n\n.fa-taxi::before {\n  content: "\\f1ba";\n}\n\n.fa-cab::before {\n  content: "\\f1ba";\n}\n\n.fa-person-circle-plus::before {\n  content: "\\e541";\n}\n\n.fa-chart-pie::before {\n  content: "\\f200";\n}\n\n.fa-pie-chart::before {\n  content: "\\f200";\n}\n\n.fa-bolt-lightning::before {\n  content: "\\e0b7";\n}\n\n.fa-sack-xmark::before {\n  content: "\\e56a";\n}\n\n.fa-file-excel::before {\n  content: "\\f1c3";\n}\n\n.fa-file-contract::before {\n  content: "\\f56c";\n}\n\n.fa-fish-fins::before {\n  content: "\\e4f2";\n}\n\n.fa-building-flag::before {\n  content: "\\e4d5";\n}\n\n.fa-face-grin-beam::before {\n  content: "\\f582";\n}\n\n.fa-grin-beam::before {\n  content: "\\f582";\n}\n\n.fa-object-ungroup::before {\n  content: "\\f248";\n}\n\n.fa-poop::before {\n  content: "\\f619";\n}\n\n.fa-location-pin::before {\n  content: "\\f041";\n}\n\n.fa-map-marker::before {\n  content: "\\f041";\n}\n\n.fa-kaaba::before {\n  content: "\\f66b";\n}\n\n.fa-toilet-paper::before {\n  content: "\\f71e";\n}\n\n.fa-helmet-safety::before {\n  content: "\\f807";\n}\n\n.fa-hard-hat::before {\n  content: "\\f807";\n}\n\n.fa-hat-hard::before {\n  content: "\\f807";\n}\n\n.fa-eject::before {\n  content: "\\f052";\n}\n\n.fa-circle-right::before {\n  content: "\\f35a";\n}\n\n.fa-arrow-alt-circle-right::before {\n  content: "\\f35a";\n}\n\n.fa-plane-circle-check::before {\n  content: "\\e555";\n}\n\n.fa-face-rolling-eyes::before {\n  content: "\\f5a5";\n}\n\n.fa-meh-rolling-eyes::before {\n  content: "\\f5a5";\n}\n\n.fa-object-group::before {\n  content: "\\f247";\n}\n\n.fa-chart-line::before {\n  content: "\\f201";\n}\n\n.fa-line-chart::before {\n  content: "\\f201";\n}\n\n.fa-mask-ventilator::before {\n  content: "\\e524";\n}\n\n.fa-arrow-right::before {\n  content: "\\f061";\n}\n\n.fa-signs-post::before {\n  content: "\\f277";\n}\n\n.fa-map-signs::before {\n  content: "\\f277";\n}\n\n.fa-cash-register::before {\n  content: "\\f788";\n}\n\n.fa-person-circle-question::before {\n  content: "\\e542";\n}\n\n.fa-h::before {\n  content: "H";\n}\n\n.fa-tarp::before {\n  content: "\\e57b";\n}\n\n.fa-screwdriver-wrench::before {\n  content: "\\f7d9";\n}\n\n.fa-tools::before {\n  content: "\\f7d9";\n}\n\n.fa-arrows-to-eye::before {\n  content: "\\e4bf";\n}\n\n.fa-plug-circle-bolt::before {\n  content: "\\e55b";\n}\n\n.fa-heart::before {\n  content: "\\f004";\n}\n\n.fa-mars-and-venus::before {\n  content: "\\f224";\n}\n\n.fa-house-user::before {\n  content: "\\e1b0";\n}\n\n.fa-home-user::before {\n  content: "\\e1b0";\n}\n\n.fa-dumpster-fire::before {\n  content: "\\f794";\n}\n\n.fa-house-crack::before {\n  content: "\\e3b1";\n}\n\n.fa-martini-glass-citrus::before {\n  content: "\\f561";\n}\n\n.fa-cocktail::before {\n  content: "\\f561";\n}\n\n.fa-face-surprise::before {\n  content: "\\f5c2";\n}\n\n.fa-surprise::before {\n  content: "\\f5c2";\n}\n\n.fa-bottle-water::before {\n  content: "\\e4c5";\n}\n\n.fa-circle-pause::before {\n  content: "\\f28b";\n}\n\n.fa-pause-circle::before {\n  content: "\\f28b";\n}\n\n.fa-toilet-paper-slash::before {\n  content: "\\e072";\n}\n\n.fa-apple-whole::before {\n  content: "\\f5d1";\n}\n\n.fa-apple-alt::before {\n  content: "\\f5d1";\n}\n\n.fa-kitchen-set::before {\n  content: "\\e51a";\n}\n\n.fa-r::before {\n  content: "R";\n}\n\n.fa-temperature-quarter::before {\n  content: "\\f2ca";\n}\n\n.fa-temperature-1::before {\n  content: "\\f2ca";\n}\n\n.fa-thermometer-1::before {\n  content: "\\f2ca";\n}\n\n.fa-thermometer-quarter::before {\n  content: "\\f2ca";\n}\n\n.fa-cube::before {\n  content: "\\f1b2";\n}\n\n.fa-bitcoin-sign::before {\n  content: "\\e0b4";\n}\n\n.fa-shield-dog::before {\n  content: "\\e573";\n}\n\n.fa-solar-panel::before {\n  content: "\\f5ba";\n}\n\n.fa-lock-open::before {\n  content: "\\f3c1";\n}\n\n.fa-elevator::before {\n  content: "\\e16d";\n}\n\n.fa-money-bill-transfer::before {\n  content: "\\e528";\n}\n\n.fa-money-bill-trend-up::before {\n  content: "\\e529";\n}\n\n.fa-house-flood-water-circle-arrow-right::before {\n  content: "\\e50f";\n}\n\n.fa-square-poll-horizontal::before {\n  content: "\\f682";\n}\n\n.fa-poll-h::before {\n  content: "\\f682";\n}\n\n.fa-circle::before {\n  content: "\\f111";\n}\n\n.fa-backward-fast::before {\n  content: "\\f049";\n}\n\n.fa-fast-backward::before {\n  content: "\\f049";\n}\n\n.fa-recycle::before {\n  content: "\\f1b8";\n}\n\n.fa-user-astronaut::before {\n  content: "\\f4fb";\n}\n\n.fa-plane-slash::before {\n  content: "\\e069";\n}\n\n.fa-trademark::before {\n  content: "\\f25c";\n}\n\n.fa-basketball::before {\n  content: "\\f434";\n}\n\n.fa-basketball-ball::before {\n  content: "\\f434";\n}\n\n.fa-satellite-dish::before {\n  content: "\\f7c0";\n}\n\n.fa-circle-up::before {\n  content: "\\f35b";\n}\n\n.fa-arrow-alt-circle-up::before {\n  content: "\\f35b";\n}\n\n.fa-mobile-screen-button::before {\n  content: "\\f3cd";\n}\n\n.fa-mobile-alt::before {\n  content: "\\f3cd";\n}\n\n.fa-volume-high::before {\n  content: "\\f028";\n}\n\n.fa-volume-up::before {\n  content: "\\f028";\n}\n\n.fa-users-rays::before {\n  content: "\\e593";\n}\n\n.fa-wallet::before {\n  content: "\\f555";\n}\n\n.fa-clipboard-check::before {\n  content: "\\f46c";\n}\n\n.fa-file-audio::before {\n  content: "\\f1c7";\n}\n\n.fa-burger::before {\n  content: "\\f805";\n}\n\n.fa-hamburger::before {\n  content: "\\f805";\n}\n\n.fa-wrench::before {\n  content: "\\f0ad";\n}\n\n.fa-bugs::before {\n  content: "\\e4d0";\n}\n\n.fa-rupee-sign::before {\n  content: "\\f156";\n}\n\n.fa-rupee::before {\n  content: "\\f156";\n}\n\n.fa-file-image::before {\n  content: "\\f1c5";\n}\n\n.fa-circle-question::before {\n  content: "\\f059";\n}\n\n.fa-question-circle::before {\n  content: "\\f059";\n}\n\n.fa-plane-departure::before {\n  content: "\\f5b0";\n}\n\n.fa-handshake-slash::before {\n  content: "\\e060";\n}\n\n.fa-book-bookmark::before {\n  content: "\\e0bb";\n}\n\n.fa-code-branch::before {\n  content: "\\f126";\n}\n\n.fa-hat-cowboy::before {\n  content: "\\f8c0";\n}\n\n.fa-bridge::before {\n  content: "\\e4c8";\n}\n\n.fa-phone-flip::before {\n  content: "\\f879";\n}\n\n.fa-phone-alt::before {\n  content: "\\f879";\n}\n\n.fa-truck-front::before {\n  content: "\\e2b7";\n}\n\n.fa-cat::before {\n  content: "\\f6be";\n}\n\n.fa-anchor-circle-exclamation::before {\n  content: "\\e4ab";\n}\n\n.fa-truck-field::before {\n  content: "\\e58d";\n}\n\n.fa-route::before {\n  content: "\\f4d7";\n}\n\n.fa-clipboard-question::before {\n  content: "\\e4e3";\n}\n\n.fa-panorama::before {\n  content: "\\e209";\n}\n\n.fa-comment-medical::before {\n  content: "\\f7f5";\n}\n\n.fa-teeth-open::before {\n  content: "\\f62f";\n}\n\n.fa-file-circle-minus::before {\n  content: "\\e4ed";\n}\n\n.fa-tags::before {\n  content: "\\f02c";\n}\n\n.fa-wine-glass::before {\n  content: "\\f4e3";\n}\n\n.fa-forward-fast::before {\n  content: "\\f050";\n}\n\n.fa-fast-forward::before {\n  content: "\\f050";\n}\n\n.fa-face-meh-blank::before {\n  content: "\\f5a4";\n}\n\n.fa-meh-blank::before {\n  content: "\\f5a4";\n}\n\n.fa-square-parking::before {\n  content: "\\f540";\n}\n\n.fa-parking::before {\n  content: "\\f540";\n}\n\n.fa-house-signal::before {\n  content: "\\e012";\n}\n\n.fa-bars-progress::before {\n  content: "\\f828";\n}\n\n.fa-tasks-alt::before {\n  content: "\\f828";\n}\n\n.fa-faucet-drip::before {\n  content: "\\e006";\n}\n\n.fa-cart-flatbed::before {\n  content: "\\f474";\n}\n\n.fa-dolly-flatbed::before {\n  content: "\\f474";\n}\n\n.fa-ban-smoking::before {\n  content: "\\f54d";\n}\n\n.fa-smoking-ban::before {\n  content: "\\f54d";\n}\n\n.fa-terminal::before {\n  content: "\\f120";\n}\n\n.fa-mobile-button::before {\n  content: "\\f10b";\n}\n\n.fa-house-medical-flag::before {\n  content: "\\e514";\n}\n\n.fa-basket-shopping::before {\n  content: "\\f291";\n}\n\n.fa-shopping-basket::before {\n  content: "\\f291";\n}\n\n.fa-tape::before {\n  content: "\\f4db";\n}\n\n.fa-bus-simple::before {\n  content: "\\f55e";\n}\n\n.fa-bus-alt::before {\n  content: "\\f55e";\n}\n\n.fa-eye::before {\n  content: "\\f06e";\n}\n\n.fa-face-sad-cry::before {\n  content: "\\f5b3";\n}\n\n.fa-sad-cry::before {\n  content: "\\f5b3";\n}\n\n.fa-audio-description::before {\n  content: "\\f29e";\n}\n\n.fa-person-military-to-person::before {\n  content: "\\e54c";\n}\n\n.fa-file-shield::before {\n  content: "\\e4f0";\n}\n\n.fa-user-slash::before {\n  content: "\\f506";\n}\n\n.fa-pen::before {\n  content: "\\f304";\n}\n\n.fa-tower-observation::before {\n  content: "\\e586";\n}\n\n.fa-file-code::before {\n  content: "\\f1c9";\n}\n\n.fa-signal::before {\n  content: "\\f012";\n}\n\n.fa-signal-5::before {\n  content: "\\f012";\n}\n\n.fa-signal-perfect::before {\n  content: "\\f012";\n}\n\n.fa-bus::before {\n  content: "\\f207";\n}\n\n.fa-heart-circle-xmark::before {\n  content: "\\e501";\n}\n\n.fa-house-chimney::before {\n  content: "\\e3af";\n}\n\n.fa-home-lg::before {\n  content: "\\e3af";\n}\n\n.fa-window-maximize::before {\n  content: "\\f2d0";\n}\n\n.fa-face-frown::before {\n  content: "\\f119";\n}\n\n.fa-frown::before {\n  content: "\\f119";\n}\n\n.fa-prescription::before {\n  content: "\\f5b1";\n}\n\n.fa-shop::before {\n  content: "\\f54f";\n}\n\n.fa-store-alt::before {\n  content: "\\f54f";\n}\n\n.fa-floppy-disk::before {\n  content: "\\f0c7";\n}\n\n.fa-save::before {\n  content: "\\f0c7";\n}\n\n.fa-vihara::before {\n  content: "\\f6a7";\n}\n\n.fa-scale-unbalanced::before {\n  content: "\\f515";\n}\n\n.fa-balance-scale-left::before {\n  content: "\\f515";\n}\n\n.fa-sort-up::before {\n  content: "\\f0de";\n}\n\n.fa-sort-asc::before {\n  content: "\\f0de";\n}\n\n.fa-comment-dots::before {\n  content: "\\f4ad";\n}\n\n.fa-commenting::before {\n  content: "\\f4ad";\n}\n\n.fa-plant-wilt::before {\n  content: "\\e5aa";\n}\n\n.fa-diamond::before {\n  content: "\\f219";\n}\n\n.fa-face-grin-squint::before {\n  content: "\\f585";\n}\n\n.fa-grin-squint::before {\n  content: "\\f585";\n}\n\n.fa-hand-holding-dollar::before {\n  content: "\\f4c0";\n}\n\n.fa-hand-holding-usd::before {\n  content: "\\f4c0";\n}\n\n.fa-bacterium::before {\n  content: "\\e05a";\n}\n\n.fa-hand-pointer::before {\n  content: "\\f25a";\n}\n\n.fa-drum-steelpan::before {\n  content: "\\f56a";\n}\n\n.fa-hand-scissors::before {\n  content: "\\f257";\n}\n\n.fa-hands-praying::before {\n  content: "\\f684";\n}\n\n.fa-praying-hands::before {\n  content: "\\f684";\n}\n\n.fa-arrow-rotate-right::before {\n  content: "\\f01e";\n}\n\n.fa-arrow-right-rotate::before {\n  content: "\\f01e";\n}\n\n.fa-arrow-rotate-forward::before {\n  content: "\\f01e";\n}\n\n.fa-redo::before {\n  content: "\\f01e";\n}\n\n.fa-biohazard::before {\n  content: "\\f780";\n}\n\n.fa-location-crosshairs::before {\n  content: "\\f601";\n}\n\n.fa-location::before {\n  content: "\\f601";\n}\n\n.fa-mars-double::before {\n  content: "\\f227";\n}\n\n.fa-child-dress::before {\n  content: "\\e59c";\n}\n\n.fa-users-between-lines::before {\n  content: "\\e591";\n}\n\n.fa-lungs-virus::before {\n  content: "\\e067";\n}\n\n.fa-face-grin-tears::before {\n  content: "\\f588";\n}\n\n.fa-grin-tears::before {\n  content: "\\f588";\n}\n\n.fa-phone::before {\n  content: "\\f095";\n}\n\n.fa-calendar-xmark::before {\n  content: "\\f273";\n}\n\n.fa-calendar-times::before {\n  content: "\\f273";\n}\n\n.fa-child-reaching::before {\n  content: "\\e59d";\n}\n\n.fa-head-side-virus::before {\n  content: "\\e064";\n}\n\n.fa-user-gear::before {\n  content: "\\f4fe";\n}\n\n.fa-user-cog::before {\n  content: "\\f4fe";\n}\n\n.fa-arrow-up-1-9::before {\n  content: "\\f163";\n}\n\n.fa-sort-numeric-up::before {\n  content: "\\f163";\n}\n\n.fa-door-closed::before {\n  content: "\\f52a";\n}\n\n.fa-shield-virus::before {\n  content: "\\e06c";\n}\n\n.fa-dice-six::before {\n  content: "\\f526";\n}\n\n.fa-mosquito-net::before {\n  content: "\\e52c";\n}\n\n.fa-bridge-water::before {\n  content: "\\e4ce";\n}\n\n.fa-person-booth::before {\n  content: "\\f756";\n}\n\n.fa-text-width::before {\n  content: "\\f035";\n}\n\n.fa-hat-wizard::before {\n  content: "\\f6e8";\n}\n\n.fa-pen-fancy::before {\n  content: "\\f5ac";\n}\n\n.fa-person-digging::before {\n  content: "\\f85e";\n}\n\n.fa-digging::before {\n  content: "\\f85e";\n}\n\n.fa-trash::before {\n  content: "\\f1f8";\n}\n\n.fa-gauge-simple::before {\n  content: "\\f629";\n}\n\n.fa-gauge-simple-med::before {\n  content: "\\f629";\n}\n\n.fa-tachometer-average::before {\n  content: "\\f629";\n}\n\n.fa-book-medical::before {\n  content: "\\f7e6";\n}\n\n.fa-poo::before {\n  content: "\\f2fe";\n}\n\n.fa-quote-right::before {\n  content: "\\f10e";\n}\n\n.fa-quote-right-alt::before {\n  content: "\\f10e";\n}\n\n.fa-shirt::before {\n  content: "\\f553";\n}\n\n.fa-t-shirt::before {\n  content: "\\f553";\n}\n\n.fa-tshirt::before {\n  content: "\\f553";\n}\n\n.fa-cubes::before {\n  content: "\\f1b3";\n}\n\n.fa-divide::before {\n  content: "\\f529";\n}\n\n.fa-tenge-sign::before {\n  content: "\\f7d7";\n}\n\n.fa-tenge::before {\n  content: "\\f7d7";\n}\n\n.fa-headphones::before {\n  content: "\\f025";\n}\n\n.fa-hands-holding::before {\n  content: "\\f4c2";\n}\n\n.fa-hands-clapping::before {\n  content: "\\e1a8";\n}\n\n.fa-republican::before {\n  content: "\\f75e";\n}\n\n.fa-arrow-left::before {\n  content: "\\f060";\n}\n\n.fa-person-circle-xmark::before {\n  content: "\\e543";\n}\n\n.fa-ruler::before {\n  content: "\\f545";\n}\n\n.fa-align-left::before {\n  content: "\\f036";\n}\n\n.fa-dice-d6::before {\n  content: "\\f6d1";\n}\n\n.fa-restroom::before {\n  content: "\\f7bd";\n}\n\n.fa-j::before {\n  content: "J";\n}\n\n.fa-users-viewfinder::before {\n  content: "\\e595";\n}\n\n.fa-file-video::before {\n  content: "\\f1c8";\n}\n\n.fa-up-right-from-square::before {\n  content: "\\f35d";\n}\n\n.fa-external-link-alt::before {\n  content: "\\f35d";\n}\n\n.fa-table-cells::before {\n  content: "\\f00a";\n}\n\n.fa-th::before {\n  content: "\\f00a";\n}\n\n.fa-file-pdf::before {\n  content: "\\f1c1";\n}\n\n.fa-book-bible::before {\n  content: "\\f647";\n}\n\n.fa-bible::before {\n  content: "\\f647";\n}\n\n.fa-o::before {\n  content: "O";\n}\n\n.fa-suitcase-medical::before {\n  content: "\\f0fa";\n}\n\n.fa-medkit::before {\n  content: "\\f0fa";\n}\n\n.fa-user-secret::before {\n  content: "\\f21b";\n}\n\n.fa-otter::before {\n  content: "\\f700";\n}\n\n.fa-person-dress::before {\n  content: "\\f182";\n}\n\n.fa-female::before {\n  content: "\\f182";\n}\n\n.fa-comment-dollar::before {\n  content: "\\f651";\n}\n\n.fa-business-time::before {\n  content: "\\f64a";\n}\n\n.fa-briefcase-clock::before {\n  content: "\\f64a";\n}\n\n.fa-table-cells-large::before {\n  content: "\\f009";\n}\n\n.fa-th-large::before {\n  content: "\\f009";\n}\n\n.fa-book-tanakh::before {\n  content: "\\f827";\n}\n\n.fa-tanakh::before {\n  content: "\\f827";\n}\n\n.fa-phone-volume::before {\n  content: "\\f2a0";\n}\n\n.fa-volume-control-phone::before {\n  content: "\\f2a0";\n}\n\n.fa-hat-cowboy-side::before {\n  content: "\\f8c1";\n}\n\n.fa-clipboard-user::before {\n  content: "\\f7f3";\n}\n\n.fa-child::before {\n  content: "\\f1ae";\n}\n\n.fa-lira-sign::before {\n  content: "\\f195";\n}\n\n.fa-satellite::before {\n  content: "\\f7bf";\n}\n\n.fa-plane-lock::before {\n  content: "\\e558";\n}\n\n.fa-tag::before {\n  content: "\\f02b";\n}\n\n.fa-comment::before {\n  content: "\\f075";\n}\n\n.fa-cake-candles::before {\n  content: "\\f1fd";\n}\n\n.fa-birthday-cake::before {\n  content: "\\f1fd";\n}\n\n.fa-cake::before {\n  content: "\\f1fd";\n}\n\n.fa-envelope::before {\n  content: "\\f0e0";\n}\n\n.fa-angles-up::before {\n  content: "\\f102";\n}\n\n.fa-angle-double-up::before {\n  content: "\\f102";\n}\n\n.fa-paperclip::before {\n  content: "\\f0c6";\n}\n\n.fa-arrow-right-to-city::before {\n  content: "\\e4b3";\n}\n\n.fa-ribbon::before {\n  content: "\\f4d6";\n}\n\n.fa-lungs::before {\n  content: "\\f604";\n}\n\n.fa-arrow-up-9-1::before {\n  content: "\\f887";\n}\n\n.fa-sort-numeric-up-alt::before {\n  content: "\\f887";\n}\n\n.fa-litecoin-sign::before {\n  content: "\\e1d3";\n}\n\n.fa-border-none::before {\n  content: "\\f850";\n}\n\n.fa-circle-nodes::before {\n  content: "\\e4e2";\n}\n\n.fa-parachute-box::before {\n  content: "\\f4cd";\n}\n\n.fa-indent::before {\n  content: "\\f03c";\n}\n\n.fa-truck-field-un::before {\n  content: "\\e58e";\n}\n\n.fa-hourglass::before {\n  content: "\\f254";\n}\n\n.fa-hourglass-empty::before {\n  content: "\\f254";\n}\n\n.fa-mountain::before {\n  content: "\\f6fc";\n}\n\n.fa-user-doctor::before {\n  content: "\\f0f0";\n}\n\n.fa-user-md::before {\n  content: "\\f0f0";\n}\n\n.fa-circle-info::before {\n  content: "\\f05a";\n}\n\n.fa-info-circle::before {\n  content: "\\f05a";\n}\n\n.fa-cloud-meatball::before {\n  content: "\\f73b";\n}\n\n.fa-camera::before {\n  content: "\\f030";\n}\n\n.fa-camera-alt::before {\n  content: "\\f030";\n}\n\n.fa-square-virus::before {\n  content: "\\e578";\n}\n\n.fa-meteor::before {\n  content: "\\f753";\n}\n\n.fa-car-on::before {\n  content: "\\e4dd";\n}\n\n.fa-sleigh::before {\n  content: "\\f7cc";\n}\n\n.fa-arrow-down-1-9::before {\n  content: "\\f162";\n}\n\n.fa-sort-numeric-asc::before {\n  content: "\\f162";\n}\n\n.fa-sort-numeric-down::before {\n  content: "\\f162";\n}\n\n.fa-hand-holding-droplet::before {\n  content: "\\f4c1";\n}\n\n.fa-hand-holding-water::before {\n  content: "\\f4c1";\n}\n\n.fa-water::before {\n  content: "\\f773";\n}\n\n.fa-calendar-check::before {\n  content: "\\f274";\n}\n\n.fa-braille::before {\n  content: "\\f2a1";\n}\n\n.fa-prescription-bottle-medical::before {\n  content: "\\f486";\n}\n\n.fa-prescription-bottle-alt::before {\n  content: "\\f486";\n}\n\n.fa-landmark::before {\n  content: "\\f66f";\n}\n\n.fa-truck::before {\n  content: "\\f0d1";\n}\n\n.fa-crosshairs::before {\n  content: "\\f05b";\n}\n\n.fa-person-cane::before {\n  content: "\\e53c";\n}\n\n.fa-tent::before {\n  content: "\\e57d";\n}\n\n.fa-vest-patches::before {\n  content: "\\e086";\n}\n\n.fa-check-double::before {\n  content: "\\f560";\n}\n\n.fa-arrow-down-a-z::before {\n  content: "\\f15d";\n}\n\n.fa-sort-alpha-asc::before {\n  content: "\\f15d";\n}\n\n.fa-sort-alpha-down::before {\n  content: "\\f15d";\n}\n\n.fa-money-bill-wheat::before {\n  content: "\\e52a";\n}\n\n.fa-cookie::before {\n  content: "\\f563";\n}\n\n.fa-arrow-rotate-left::before {\n  content: "\\f0e2";\n}\n\n.fa-arrow-left-rotate::before {\n  content: "\\f0e2";\n}\n\n.fa-arrow-rotate-back::before {\n  content: "\\f0e2";\n}\n\n.fa-arrow-rotate-backward::before {\n  content: "\\f0e2";\n}\n\n.fa-undo::before {\n  content: "\\f0e2";\n}\n\n.fa-hard-drive::before {\n  content: "\\f0a0";\n}\n\n.fa-hdd::before {\n  content: "\\f0a0";\n}\n\n.fa-face-grin-squint-tears::before {\n  content: "\\f586";\n}\n\n.fa-grin-squint-tears::before {\n  content: "\\f586";\n}\n\n.fa-dumbbell::before {\n  content: "\\f44b";\n}\n\n.fa-rectangle-list::before {\n  content: "\\f022";\n}\n\n.fa-list-alt::before {\n  content: "\\f022";\n}\n\n.fa-tarp-droplet::before {\n  content: "\\e57c";\n}\n\n.fa-house-medical-circle-check::before {\n  content: "\\e511";\n}\n\n.fa-person-skiing-nordic::before {\n  content: "\\f7ca";\n}\n\n.fa-skiing-nordic::before {\n  content: "\\f7ca";\n}\n\n.fa-calendar-plus::before {\n  content: "\\f271";\n}\n\n.fa-plane-arrival::before {\n  content: "\\f5af";\n}\n\n.fa-circle-left::before {\n  content: "\\f359";\n}\n\n.fa-arrow-alt-circle-left::before {\n  content: "\\f359";\n}\n\n.fa-train-subway::before {\n  content: "\\f239";\n}\n\n.fa-subway::before {\n  content: "\\f239";\n}\n\n.fa-chart-gantt::before {\n  content: "\\e0e4";\n}\n\n.fa-indian-rupee-sign::before {\n  content: "\\e1bc";\n}\n\n.fa-indian-rupee::before {\n  content: "\\e1bc";\n}\n\n.fa-inr::before {\n  content: "\\e1bc";\n}\n\n.fa-crop-simple::before {\n  content: "\\f565";\n}\n\n.fa-crop-alt::before {\n  content: "\\f565";\n}\n\n.fa-money-bill-1::before {\n  content: "\\f3d1";\n}\n\n.fa-money-bill-alt::before {\n  content: "\\f3d1";\n}\n\n.fa-left-long::before {\n  content: "\\f30a";\n}\n\n.fa-long-arrow-alt-left::before {\n  content: "\\f30a";\n}\n\n.fa-dna::before {\n  content: "\\f471";\n}\n\n.fa-virus-slash::before {\n  content: "\\e075";\n}\n\n.fa-minus::before {\n  content: "\\f068";\n}\n\n.fa-subtract::before {\n  content: "\\f068";\n}\n\n.fa-child-rifle::before {\n  content: "\\e4e0";\n}\n\n.fa-chess::before {\n  content: "\\f439";\n}\n\n.fa-arrow-left-long::before {\n  content: "\\f177";\n}\n\n.fa-long-arrow-left::before {\n  content: "\\f177";\n}\n\n.fa-plug-circle-check::before {\n  content: "\\e55c";\n}\n\n.fa-street-view::before {\n  content: "\\f21d";\n}\n\n.fa-franc-sign::before {\n  content: "\\e18f";\n}\n\n.fa-volume-off::before {\n  content: "\\f026";\n}\n\n.fa-hands-asl-interpreting::before {\n  content: "\\f2a3";\n}\n\n.fa-american-sign-language-interpreting::before {\n  content: "\\f2a3";\n}\n\n.fa-asl-interpreting::before {\n  content: "\\f2a3";\n}\n\n.fa-hands-american-sign-language-interpreting::before {\n  content: "\\f2a3";\n}\n\n.fa-gear::before {\n  content: "\\f013";\n}\n\n.fa-cog::before {\n  content: "\\f013";\n}\n\n.fa-droplet-slash::before {\n  content: "\\f5c7";\n}\n\n.fa-tint-slash::before {\n  content: "\\f5c7";\n}\n\n.fa-mosque::before {\n  content: "\\f678";\n}\n\n.fa-mosquito::before {\n  content: "\\e52b";\n}\n\n.fa-star-of-david::before {\n  content: "\\f69a";\n}\n\n.fa-person-military-rifle::before {\n  content: "\\e54b";\n}\n\n.fa-cart-shopping::before {\n  content: "\\f07a";\n}\n\n.fa-shopping-cart::before {\n  content: "\\f07a";\n}\n\n.fa-vials::before {\n  content: "\\f493";\n}\n\n.fa-plug-circle-plus::before {\n  content: "\\e55f";\n}\n\n.fa-place-of-worship::before {\n  content: "\\f67f";\n}\n\n.fa-grip-vertical::before {\n  content: "\\f58e";\n}\n\n.fa-arrow-turn-up::before {\n  content: "\\f148";\n}\n\n.fa-level-up::before {\n  content: "\\f148";\n}\n\n.fa-u::before {\n  content: "U";\n}\n\n.fa-square-root-variable::before {\n  content: "\\f698";\n}\n\n.fa-square-root-alt::before {\n  content: "\\f698";\n}\n\n.fa-clock::before {\n  content: "\\f017";\n}\n\n.fa-clock-four::before {\n  content: "\\f017";\n}\n\n.fa-backward-step::before {\n  content: "\\f048";\n}\n\n.fa-step-backward::before {\n  content: "\\f048";\n}\n\n.fa-pallet::before {\n  content: "\\f482";\n}\n\n.fa-faucet::before {\n  content: "\\e005";\n}\n\n.fa-baseball-bat-ball::before {\n  content: "\\f432";\n}\n\n.fa-s::before {\n  content: "S";\n}\n\n.fa-timeline::before {\n  content: "\\e29c";\n}\n\n.fa-keyboard::before {\n  content: "\\f11c";\n}\n\n.fa-caret-down::before {\n  content: "\\f0d7";\n}\n\n.fa-house-chimney-medical::before {\n  content: "\\f7f2";\n}\n\n.fa-clinic-medical::before {\n  content: "\\f7f2";\n}\n\n.fa-temperature-three-quarters::before {\n  content: "\\f2c8";\n}\n\n.fa-temperature-3::before {\n  content: "\\f2c8";\n}\n\n.fa-thermometer-3::before {\n  content: "\\f2c8";\n}\n\n.fa-thermometer-three-quarters::before {\n  content: "\\f2c8";\n}\n\n.fa-mobile-screen::before {\n  content: "\\f3cf";\n}\n\n.fa-mobile-android-alt::before {\n  content: "\\f3cf";\n}\n\n.fa-plane-up::before {\n  content: "\\e22d";\n}\n\n.fa-piggy-bank::before {\n  content: "\\f4d3";\n}\n\n.fa-battery-half::before {\n  content: "\\f242";\n}\n\n.fa-battery-3::before {\n  content: "\\f242";\n}\n\n.fa-mountain-city::before {\n  content: "\\e52e";\n}\n\n.fa-coins::before {\n  content: "\\f51e";\n}\n\n.fa-khanda::before {\n  content: "\\f66d";\n}\n\n.fa-sliders::before {\n  content: "\\f1de";\n}\n\n.fa-sliders-h::before {\n  content: "\\f1de";\n}\n\n.fa-folder-tree::before {\n  content: "\\f802";\n}\n\n.fa-network-wired::before {\n  content: "\\f6ff";\n}\n\n.fa-map-pin::before {\n  content: "\\f276";\n}\n\n.fa-hamsa::before {\n  content: "\\f665";\n}\n\n.fa-cent-sign::before {\n  content: "\\e3f5";\n}\n\n.fa-flask::before {\n  content: "\\f0c3";\n}\n\n.fa-person-pregnant::before {\n  content: "\\e31e";\n}\n\n.fa-wand-sparkles::before {\n  content: "\\f72b";\n}\n\n.fa-ellipsis-vertical::before {\n  content: "\\f142";\n}\n\n.fa-ellipsis-v::before {\n  content: "\\f142";\n}\n\n.fa-ticket::before {\n  content: "\\f145";\n}\n\n.fa-power-off::before {\n  content: "\\f011";\n}\n\n.fa-right-long::before {\n  content: "\\f30b";\n}\n\n.fa-long-arrow-alt-right::before {\n  content: "\\f30b";\n}\n\n.fa-flag-usa::before {\n  content: "\\f74d";\n}\n\n.fa-laptop-file::before {\n  content: "\\e51d";\n}\n\n.fa-tty::before {\n  content: "\\f1e4";\n}\n\n.fa-teletype::before {\n  content: "\\f1e4";\n}\n\n.fa-diagram-next::before {\n  content: "\\e476";\n}\n\n.fa-person-rifle::before {\n  content: "\\e54e";\n}\n\n.fa-house-medical-circle-exclamation::before {\n  content: "\\e512";\n}\n\n.fa-closed-captioning::before {\n  content: "\\f20a";\n}\n\n.fa-person-hiking::before {\n  content: "\\f6ec";\n}\n\n.fa-hiking::before {\n  content: "\\f6ec";\n}\n\n.fa-venus-double::before {\n  content: "\\f226";\n}\n\n.fa-images::before {\n  content: "\\f302";\n}\n\n.fa-calculator::before {\n  content: "\\f1ec";\n}\n\n.fa-people-pulling::before {\n  content: "\\e535";\n}\n\n.fa-n::before {\n  content: "N";\n}\n\n.fa-cable-car::before {\n  content: "\\f7da";\n}\n\n.fa-tram::before {\n  content: "\\f7da";\n}\n\n.fa-cloud-rain::before {\n  content: "\\f73d";\n}\n\n.fa-building-circle-xmark::before {\n  content: "\\e4d4";\n}\n\n.fa-ship::before {\n  content: "\\f21a";\n}\n\n.fa-arrows-down-to-line::before {\n  content: "\\e4b8";\n}\n\n.fa-download::before {\n  content: "\\f019";\n}\n\n.fa-face-grin::before {\n  content: "\\f580";\n}\n\n.fa-grin::before {\n  content: "\\f580";\n}\n\n.fa-delete-left::before {\n  content: "\\f55a";\n}\n\n.fa-backspace::before {\n  content: "\\f55a";\n}\n\n.fa-eye-dropper::before {\n  content: "\\f1fb";\n}\n\n.fa-eye-dropper-empty::before {\n  content: "\\f1fb";\n}\n\n.fa-eyedropper::before {\n  content: "\\f1fb";\n}\n\n.fa-file-circle-check::before {\n  content: "\\e5a0";\n}\n\n.fa-forward::before {\n  content: "\\f04e";\n}\n\n.fa-mobile::before {\n  content: "\\f3ce";\n}\n\n.fa-mobile-android::before {\n  content: "\\f3ce";\n}\n\n.fa-mobile-phone::before {\n  content: "\\f3ce";\n}\n\n.fa-face-meh::before {\n  content: "\\f11a";\n}\n\n.fa-meh::before {\n  content: "\\f11a";\n}\n\n.fa-align-center::before {\n  content: "\\f037";\n}\n\n.fa-book-skull::before {\n  content: "\\f6b7";\n}\n\n.fa-book-dead::before {\n  content: "\\f6b7";\n}\n\n.fa-id-card::before {\n  content: "\\f2c2";\n}\n\n.fa-drivers-license::before {\n  content: "\\f2c2";\n}\n\n.fa-outdent::before {\n  content: "\\f03b";\n}\n\n.fa-dedent::before {\n  content: "\\f03b";\n}\n\n.fa-heart-circle-exclamation::before {\n  content: "\\e4fe";\n}\n\n.fa-house::before {\n  content: "\\f015";\n}\n\n.fa-home::before {\n  content: "\\f015";\n}\n\n.fa-home-alt::before {\n  content: "\\f015";\n}\n\n.fa-home-lg-alt::before {\n  content: "\\f015";\n}\n\n.fa-calendar-week::before {\n  content: "\\f784";\n}\n\n.fa-laptop-medical::before {\n  content: "\\f812";\n}\n\n.fa-b::before {\n  content: "B";\n}\n\n.fa-file-medical::before {\n  content: "\\f477";\n}\n\n.fa-dice-one::before {\n  content: "\\f525";\n}\n\n.fa-kiwi-bird::before {\n  content: "\\f535";\n}\n\n.fa-arrow-right-arrow-left::before {\n  content: "\\f0ec";\n}\n\n.fa-exchange::before {\n  content: "\\f0ec";\n}\n\n.fa-rotate-right::before {\n  content: "\\f2f9";\n}\n\n.fa-redo-alt::before {\n  content: "\\f2f9";\n}\n\n.fa-rotate-forward::before {\n  content: "\\f2f9";\n}\n\n.fa-utensils::before {\n  content: "\\f2e7";\n}\n\n.fa-cutlery::before {\n  content: "\\f2e7";\n}\n\n.fa-arrow-up-wide-short::before {\n  content: "\\f161";\n}\n\n.fa-sort-amount-up::before {\n  content: "\\f161";\n}\n\n.fa-mill-sign::before {\n  content: "\\e1ed";\n}\n\n.fa-bowl-rice::before {\n  content: "\\e2eb";\n}\n\n.fa-skull::before {\n  content: "\\f54c";\n}\n\n.fa-tower-broadcast::before {\n  content: "\\f519";\n}\n\n.fa-broadcast-tower::before {\n  content: "\\f519";\n}\n\n.fa-truck-pickup::before {\n  content: "\\f63c";\n}\n\n.fa-up-long::before {\n  content: "\\f30c";\n}\n\n.fa-long-arrow-alt-up::before {\n  content: "\\f30c";\n}\n\n.fa-stop::before {\n  content: "\\f04d";\n}\n\n.fa-code-merge::before {\n  content: "\\f387";\n}\n\n.fa-upload::before {\n  content: "\\f093";\n}\n\n.fa-hurricane::before {\n  content: "\\f751";\n}\n\n.fa-mound::before {\n  content: "\\e52d";\n}\n\n.fa-toilet-portable::before {\n  content: "\\e583";\n}\n\n.fa-compact-disc::before {\n  content: "\\f51f";\n}\n\n.fa-file-arrow-down::before {\n  content: "\\f56d";\n}\n\n.fa-file-download::before {\n  content: "\\f56d";\n}\n\n.fa-caravan::before {\n  content: "\\f8ff";\n}\n\n.fa-shield-cat::before {\n  content: "\\e572";\n}\n\n.fa-bolt::before {\n  content: "\\f0e7";\n}\n\n.fa-zap::before {\n  content: "\\f0e7";\n}\n\n.fa-glass-water::before {\n  content: "\\e4f4";\n}\n\n.fa-oil-well::before {\n  content: "\\e532";\n}\n\n.fa-vault::before {\n  content: "\\e2c5";\n}\n\n.fa-mars::before {\n  content: "\\f222";\n}\n\n.fa-toilet::before {\n  content: "\\f7d8";\n}\n\n.fa-plane-circle-xmark::before {\n  content: "\\e557";\n}\n\n.fa-yen-sign::before {\n  content: "\\f157";\n}\n\n.fa-cny::before {\n  content: "\\f157";\n}\n\n.fa-jpy::before {\n  content: "\\f157";\n}\n\n.fa-rmb::before {\n  content: "\\f157";\n}\n\n.fa-yen::before {\n  content: "\\f157";\n}\n\n.fa-ruble-sign::before {\n  content: "\\f158";\n}\n\n.fa-rouble::before {\n  content: "\\f158";\n}\n\n.fa-rub::before {\n  content: "\\f158";\n}\n\n.fa-ruble::before {\n  content: "\\f158";\n}\n\n.fa-sun::before {\n  content: "\\f185";\n}\n\n.fa-guitar::before {\n  content: "\\f7a6";\n}\n\n.fa-face-laugh-wink::before {\n  content: "\\f59c";\n}\n\n.fa-laugh-wink::before {\n  content: "\\f59c";\n}\n\n.fa-horse-head::before {\n  content: "\\f7ab";\n}\n\n.fa-bore-hole::before {\n  content: "\\e4c3";\n}\n\n.fa-industry::before {\n  content: "\\f275";\n}\n\n.fa-circle-down::before {\n  content: "\\f358";\n}\n\n.fa-arrow-alt-circle-down::before {\n  content: "\\f358";\n}\n\n.fa-arrows-turn-to-dots::before {\n  content: "\\e4c1";\n}\n\n.fa-florin-sign::before {\n  content: "\\e184";\n}\n\n.fa-arrow-down-short-wide::before {\n  content: "\\f884";\n}\n\n.fa-sort-amount-desc::before {\n  content: "\\f884";\n}\n\n.fa-sort-amount-down-alt::before {\n  content: "\\f884";\n}\n\n.fa-less-than::before {\n  content: "\\<";\n}\n\n.fa-angle-down::before {\n  content: "\\f107";\n}\n\n.fa-car-tunnel::before {\n  content: "\\e4de";\n}\n\n.fa-head-side-cough::before {\n  content: "\\e061";\n}\n\n.fa-grip-lines::before {\n  content: "\\f7a4";\n}\n\n.fa-thumbs-down::before {\n  content: "\\f165";\n}\n\n.fa-user-lock::before {\n  content: "\\f502";\n}\n\n.fa-arrow-right-long::before {\n  content: "\\f178";\n}\n\n.fa-long-arrow-right::before {\n  content: "\\f178";\n}\n\n.fa-anchor-circle-xmark::before {\n  content: "\\e4ac";\n}\n\n.fa-ellipsis::before {\n  content: "\\f141";\n}\n\n.fa-ellipsis-h::before {\n  content: "\\f141";\n}\n\n.fa-chess-pawn::before {\n  content: "\\f443";\n}\n\n.fa-kit-medical::before {\n  content: "\\f479";\n}\n\n.fa-first-aid::before {\n  content: "\\f479";\n}\n\n.fa-person-through-window::before {\n  content: "\\e5a9";\n}\n\n.fa-toolbox::before {\n  content: "\\f552";\n}\n\n.fa-hands-holding-circle::before {\n  content: "\\e4fb";\n}\n\n.fa-bug::before {\n  content: "\\f188";\n}\n\n.fa-credit-card::before {\n  content: "\\f09d";\n}\n\n.fa-credit-card-alt::before {\n  content: "\\f09d";\n}\n\n.fa-car::before {\n  content: "\\f1b9";\n}\n\n.fa-automobile::before {\n  content: "\\f1b9";\n}\n\n.fa-hand-holding-hand::before {\n  content: "\\e4f7";\n}\n\n.fa-book-open-reader::before {\n  content: "\\f5da";\n}\n\n.fa-book-reader::before {\n  content: "\\f5da";\n}\n\n.fa-mountain-sun::before {\n  content: "\\e52f";\n}\n\n.fa-arrows-left-right-to-line::before {\n  content: "\\e4ba";\n}\n\n.fa-dice-d20::before {\n  content: "\\f6cf";\n}\n\n.fa-truck-droplet::before {\n  content: "\\e58c";\n}\n\n.fa-file-circle-xmark::before {\n  content: "\\e5a1";\n}\n\n.fa-temperature-arrow-up::before {\n  content: "\\e040";\n}\n\n.fa-temperature-up::before {\n  content: "\\e040";\n}\n\n.fa-medal::before {\n  content: "\\f5a2";\n}\n\n.fa-bed::before {\n  content: "\\f236";\n}\n\n.fa-square-h::before {\n  content: "\\f0fd";\n}\n\n.fa-h-square::before {\n  content: "\\f0fd";\n}\n\n.fa-podcast::before {\n  content: "\\f2ce";\n}\n\n.fa-temperature-full::before {\n  content: "\\f2c7";\n}\n\n.fa-temperature-4::before {\n  content: "\\f2c7";\n}\n\n.fa-thermometer-4::before {\n  content: "\\f2c7";\n}\n\n.fa-thermometer-full::before {\n  content: "\\f2c7";\n}\n\n.fa-bell::before {\n  content: "\\f0f3";\n}\n\n.fa-superscript::before {\n  content: "\\f12b";\n}\n\n.fa-plug-circle-xmark::before {\n  content: "\\e560";\n}\n\n.fa-star-of-life::before {\n  content: "\\f621";\n}\n\n.fa-phone-slash::before {\n  content: "\\f3dd";\n}\n\n.fa-paint-roller::before {\n  content: "\\f5aa";\n}\n\n.fa-handshake-angle::before {\n  content: "\\f4c4";\n}\n\n.fa-hands-helping::before {\n  content: "\\f4c4";\n}\n\n.fa-location-dot::before {\n  content: "\\f3c5";\n}\n\n.fa-map-marker-alt::before {\n  content: "\\f3c5";\n}\n\n.fa-file::before {\n  content: "\\f15b";\n}\n\n.fa-greater-than::before {\n  content: "\\>";\n}\n\n.fa-person-swimming::before {\n  content: "\\f5c4";\n}\n\n.fa-swimmer::before {\n  content: "\\f5c4";\n}\n\n.fa-arrow-down::before {\n  content: "\\f063";\n}\n\n.fa-droplet::before {\n  content: "\\f043";\n}\n\n.fa-tint::before {\n  content: "\\f043";\n}\n\n.fa-eraser::before {\n  content: "\\f12d";\n}\n\n.fa-earth-americas::before {\n  content: "\\f57d";\n}\n\n.fa-earth::before {\n  content: "\\f57d";\n}\n\n.fa-earth-america::before {\n  content: "\\f57d";\n}\n\n.fa-globe-americas::before {\n  content: "\\f57d";\n}\n\n.fa-person-burst::before {\n  content: "\\e53b";\n}\n\n.fa-dove::before {\n  content: "\\f4ba";\n}\n\n.fa-battery-empty::before {\n  content: "\\f244";\n}\n\n.fa-battery-0::before {\n  content: "\\f244";\n}\n\n.fa-socks::before {\n  content: "\\f696";\n}\n\n.fa-inbox::before {\n  content: "\\f01c";\n}\n\n.fa-section::before {\n  content: "\\e447";\n}\n\n.fa-gauge-high::before {\n  content: "\\f625";\n}\n\n.fa-tachometer-alt::before {\n  content: "\\f625";\n}\n\n.fa-tachometer-alt-fast::before {\n  content: "\\f625";\n}\n\n.fa-envelope-open-text::before {\n  content: "\\f658";\n}\n\n.fa-hospital::before {\n  content: "\\f0f8";\n}\n\n.fa-hospital-alt::before {\n  content: "\\f0f8";\n}\n\n.fa-hospital-wide::before {\n  content: "\\f0f8";\n}\n\n.fa-wine-bottle::before {\n  content: "\\f72f";\n}\n\n.fa-chess-rook::before {\n  content: "\\f447";\n}\n\n.fa-bars-staggered::before {\n  content: "\\f550";\n}\n\n.fa-reorder::before {\n  content: "\\f550";\n}\n\n.fa-stream::before {\n  content: "\\f550";\n}\n\n.fa-dharmachakra::before {\n  content: "\\f655";\n}\n\n.fa-hotdog::before {\n  content: "\\f80f";\n}\n\n.fa-person-walking-with-cane::before {\n  content: "\\f29d";\n}\n\n.fa-blind::before {\n  content: "\\f29d";\n}\n\n.fa-drum::before {\n  content: "\\f569";\n}\n\n.fa-ice-cream::before {\n  content: "\\f810";\n}\n\n.fa-heart-circle-bolt::before {\n  content: "\\e4fc";\n}\n\n.fa-fax::before {\n  content: "\\f1ac";\n}\n\n.fa-paragraph::before {\n  content: "\\f1dd";\n}\n\n.fa-check-to-slot::before {\n  content: "\\f772";\n}\n\n.fa-vote-yea::before {\n  content: "\\f772";\n}\n\n.fa-star-half::before {\n  content: "\\f089";\n}\n\n.fa-boxes-stacked::before {\n  content: "\\f468";\n}\n\n.fa-boxes::before {\n  content: "\\f468";\n}\n\n.fa-boxes-alt::before {\n  content: "\\f468";\n}\n\n.fa-link::before {\n  content: "\\f0c1";\n}\n\n.fa-chain::before {\n  content: "\\f0c1";\n}\n\n.fa-ear-listen::before {\n  content: "\\f2a2";\n}\n\n.fa-assistive-listening-systems::before {\n  content: "\\f2a2";\n}\n\n.fa-tree-city::before {\n  content: "\\e587";\n}\n\n.fa-play::before {\n  content: "\\f04b";\n}\n\n.fa-font::before {\n  content: "\\f031";\n}\n\n.fa-rupiah-sign::before {\n  content: "\\e23d";\n}\n\n.fa-magnifying-glass::before {\n  content: "\\f002";\n}\n\n.fa-search::before {\n  content: "\\f002";\n}\n\n.fa-table-tennis-paddle-ball::before {\n  content: "\\f45d";\n}\n\n.fa-ping-pong-paddle-ball::before {\n  content: "\\f45d";\n}\n\n.fa-table-tennis::before {\n  content: "\\f45d";\n}\n\n.fa-person-dots-from-line::before {\n  content: "\\f470";\n}\n\n.fa-diagnoses::before {\n  content: "\\f470";\n}\n\n.fa-trash-can-arrow-up::before {\n  content: "\\f82a";\n}\n\n.fa-trash-restore-alt::before {\n  content: "\\f82a";\n}\n\n.fa-naira-sign::before {\n  content: "\\e1f6";\n}\n\n.fa-cart-arrow-down::before {\n  content: "\\f218";\n}\n\n.fa-walkie-talkie::before {\n  content: "\\f8ef";\n}\n\n.fa-file-pen::before {\n  content: "\\f31c";\n}\n\n.fa-file-edit::before {\n  content: "\\f31c";\n}\n\n.fa-receipt::before {\n  content: "\\f543";\n}\n\n.fa-square-pen::before {\n  content: "\\f14b";\n}\n\n.fa-pen-square::before {\n  content: "\\f14b";\n}\n\n.fa-pencil-square::before {\n  content: "\\f14b";\n}\n\n.fa-suitcase-rolling::before {\n  content: "\\f5c1";\n}\n\n.fa-person-circle-exclamation::before {\n  content: "\\e53f";\n}\n\n.fa-chevron-down::before {\n  content: "\\f078";\n}\n\n.fa-battery-full::before {\n  content: "\\f240";\n}\n\n.fa-battery::before {\n  content: "\\f240";\n}\n\n.fa-battery-5::before {\n  content: "\\f240";\n}\n\n.fa-skull-crossbones::before {\n  content: "\\f714";\n}\n\n.fa-code-compare::before {\n  content: "\\e13a";\n}\n\n.fa-list-ul::before {\n  content: "\\f0ca";\n}\n\n.fa-list-dots::before {\n  content: "\\f0ca";\n}\n\n.fa-school-lock::before {\n  content: "\\e56f";\n}\n\n.fa-tower-cell::before {\n  content: "\\e585";\n}\n\n.fa-down-long::before {\n  content: "\\f309";\n}\n\n.fa-long-arrow-alt-down::before {\n  content: "\\f309";\n}\n\n.fa-ranking-star::before {\n  content: "\\e561";\n}\n\n.fa-chess-king::before {\n  content: "\\f43f";\n}\n\n.fa-person-harassing::before {\n  content: "\\e549";\n}\n\n.fa-brazilian-real-sign::before {\n  content: "\\e46c";\n}\n\n.fa-landmark-dome::before {\n  content: "\\f752";\n}\n\n.fa-landmark-alt::before {\n  content: "\\f752";\n}\n\n.fa-arrow-up::before {\n  content: "\\f062";\n}\n\n.fa-tv::before {\n  content: "\\f26c";\n}\n\n.fa-television::before {\n  content: "\\f26c";\n}\n\n.fa-tv-alt::before {\n  content: "\\f26c";\n}\n\n.fa-shrimp::before {\n  content: "\\e448";\n}\n\n.fa-list-check::before {\n  content: "\\f0ae";\n}\n\n.fa-tasks::before {\n  content: "\\f0ae";\n}\n\n.fa-jug-detergent::before {\n  content: "\\e519";\n}\n\n.fa-circle-user::before {\n  content: "\\f2bd";\n}\n\n.fa-user-circle::before {\n  content: "\\f2bd";\n}\n\n.fa-user-shield::before {\n  content: "\\f505";\n}\n\n.fa-wind::before {\n  content: "\\f72e";\n}\n\n.fa-car-burst::before {\n  content: "\\f5e1";\n}\n\n.fa-car-crash::before {\n  content: "\\f5e1";\n}\n\n.fa-y::before {\n  content: "Y";\n}\n\n.fa-person-snowboarding::before {\n  content: "\\f7ce";\n}\n\n.fa-snowboarding::before {\n  content: "\\f7ce";\n}\n\n.fa-truck-fast::before {\n  content: "\\f48b";\n}\n\n.fa-shipping-fast::before {\n  content: "\\f48b";\n}\n\n.fa-fish::before {\n  content: "\\f578";\n}\n\n.fa-user-graduate::before {\n  content: "\\f501";\n}\n\n.fa-circle-half-stroke::before {\n  content: "\\f042";\n}\n\n.fa-adjust::before {\n  content: "\\f042";\n}\n\n.fa-clapperboard::before {\n  content: "\\e131";\n}\n\n.fa-circle-radiation::before {\n  content: "\\f7ba";\n}\n\n.fa-radiation-alt::before {\n  content: "\\f7ba";\n}\n\n.fa-baseball::before {\n  content: "\\f433";\n}\n\n.fa-baseball-ball::before {\n  content: "\\f433";\n}\n\n.fa-jet-fighter-up::before {\n  content: "\\e518";\n}\n\n.fa-diagram-project::before {\n  content: "\\f542";\n}\n\n.fa-project-diagram::before {\n  content: "\\f542";\n}\n\n.fa-copy::before {\n  content: "\\f0c5";\n}\n\n.fa-volume-xmark::before {\n  content: "\\f6a9";\n}\n\n.fa-volume-mute::before {\n  content: "\\f6a9";\n}\n\n.fa-volume-times::before {\n  content: "\\f6a9";\n}\n\n.fa-hand-sparkles::before {\n  content: "\\e05d";\n}\n\n.fa-grip::before {\n  content: "\\f58d";\n}\n\n.fa-grip-horizontal::before {\n  content: "\\f58d";\n}\n\n.fa-share-from-square::before {\n  content: "\\f14d";\n}\n\n.fa-share-square::before {\n  content: "\\f14d";\n}\n\n.fa-gun::before {\n  content: "\\e19b";\n}\n\n.fa-square-phone::before {\n  content: "\\f098";\n}\n\n.fa-phone-square::before {\n  content: "\\f098";\n}\n\n.fa-plus::before {\n  content: "\\+";\n}\n\n.fa-add::before {\n  content: "\\+";\n}\n\n.fa-expand::before {\n  content: "\\f065";\n}\n\n.fa-computer::before {\n  content: "\\e4e5";\n}\n\n.fa-xmark::before {\n  content: "\\f00d";\n}\n\n.fa-close::before {\n  content: "\\f00d";\n}\n\n.fa-multiply::before {\n  content: "\\f00d";\n}\n\n.fa-remove::before {\n  content: "\\f00d";\n}\n\n.fa-times::before {\n  content: "\\f00d";\n}\n\n.fa-arrows-up-down-left-right::before {\n  content: "\\f047";\n}\n\n.fa-arrows::before {\n  content: "\\f047";\n}\n\n.fa-chalkboard-user::before {\n  content: "\\f51c";\n}\n\n.fa-chalkboard-teacher::before {\n  content: "\\f51c";\n}\n\n.fa-peso-sign::before {\n  content: "\\e222";\n}\n\n.fa-building-shield::before {\n  content: "\\e4d8";\n}\n\n.fa-baby::before {\n  content: "\\f77c";\n}\n\n.fa-users-line::before {\n  content: "\\e592";\n}\n\n.fa-quote-left::before {\n  content: "\\f10d";\n}\n\n.fa-quote-left-alt::before {\n  content: "\\f10d";\n}\n\n.fa-tractor::before {\n  content: "\\f722";\n}\n\n.fa-trash-arrow-up::before {\n  content: "\\f829";\n}\n\n.fa-trash-restore::before {\n  content: "\\f829";\n}\n\n.fa-arrow-down-up-lock::before {\n  content: "\\e4b0";\n}\n\n.fa-lines-leaning::before {\n  content: "\\e51e";\n}\n\n.fa-ruler-combined::before {\n  content: "\\f546";\n}\n\n.fa-copyright::before {\n  content: "\\f1f9";\n}\n\n.fa-equals::before {\n  content: "\\=";\n}\n\n.fa-blender::before {\n  content: "\\f517";\n}\n\n.fa-teeth::before {\n  content: "\\f62e";\n}\n\n.fa-shekel-sign::before {\n  content: "\\f20b";\n}\n\n.fa-ils::before {\n  content: "\\f20b";\n}\n\n.fa-shekel::before {\n  content: "\\f20b";\n}\n\n.fa-sheqel::before {\n  content: "\\f20b";\n}\n\n.fa-sheqel-sign::before {\n  content: "\\f20b";\n}\n\n.fa-map::before {\n  content: "\\f279";\n}\n\n.fa-rocket::before {\n  content: "\\f135";\n}\n\n.fa-photo-film::before {\n  content: "\\f87c";\n}\n\n.fa-photo-video::before {\n  content: "\\f87c";\n}\n\n.fa-folder-minus::before {\n  content: "\\f65d";\n}\n\n.fa-store::before {\n  content: "\\f54e";\n}\n\n.fa-arrow-trend-up::before {\n  content: "\\e098";\n}\n\n.fa-plug-circle-minus::before {\n  content: "\\e55e";\n}\n\n.fa-sign-hanging::before {\n  content: "\\f4d9";\n}\n\n.fa-sign::before {\n  content: "\\f4d9";\n}\n\n.fa-bezier-curve::before {\n  content: "\\f55b";\n}\n\n.fa-bell-slash::before {\n  content: "\\f1f6";\n}\n\n.fa-tablet::before {\n  content: "\\f3fb";\n}\n\n.fa-tablet-android::before {\n  content: "\\f3fb";\n}\n\n.fa-school-flag::before {\n  content: "\\e56e";\n}\n\n.fa-fill::before {\n  content: "\\f575";\n}\n\n.fa-angle-up::before {\n  content: "\\f106";\n}\n\n.fa-drumstick-bite::before {\n  content: "\\f6d7";\n}\n\n.fa-holly-berry::before {\n  content: "\\f7aa";\n}\n\n.fa-chevron-left::before {\n  content: "\\f053";\n}\n\n.fa-bacteria::before {\n  content: "\\e059";\n}\n\n.fa-hand-lizard::before {\n  content: "\\f258";\n}\n\n.fa-disease::before {\n  content: "\\f7fa";\n}\n\n.fa-briefcase-medical::before {\n  content: "\\f469";\n}\n\n.fa-genderless::before {\n  content: "\\f22d";\n}\n\n.fa-chevron-right::before {\n  content: "\\f054";\n}\n\n.fa-retweet::before {\n  content: "\\f079";\n}\n\n.fa-car-rear::before {\n  content: "\\f5de";\n}\n\n.fa-car-alt::before {\n  content: "\\f5de";\n}\n\n.fa-pump-soap::before {\n  content: "\\e06b";\n}\n\n.fa-video-slash::before {\n  content: "\\f4e2";\n}\n\n.fa-battery-quarter::before {\n  content: "\\f243";\n}\n\n.fa-battery-2::before {\n  content: "\\f243";\n}\n\n.fa-radio::before {\n  content: "\\f8d7";\n}\n\n.fa-baby-carriage::before {\n  content: "\\f77d";\n}\n\n.fa-carriage-baby::before {\n  content: "\\f77d";\n}\n\n.fa-traffic-light::before {\n  content: "\\f637";\n}\n\n.fa-thermometer::before {\n  content: "\\f491";\n}\n\n.fa-vr-cardboard::before {\n  content: "\\f729";\n}\n\n.fa-hand-middle-finger::before {\n  content: "\\f806";\n}\n\n.fa-percent::before {\n  content: "\\%";\n}\n\n.fa-percentage::before {\n  content: "\\%";\n}\n\n.fa-truck-moving::before {\n  content: "\\f4df";\n}\n\n.fa-glass-water-droplet::before {\n  content: "\\e4f5";\n}\n\n.fa-display::before {\n  content: "\\e163";\n}\n\n.fa-face-smile::before {\n  content: "\\f118";\n}\n\n.fa-smile::before {\n  content: "\\f118";\n}\n\n.fa-thumbtack::before {\n  content: "\\f08d";\n}\n\n.fa-thumb-tack::before {\n  content: "\\f08d";\n}\n\n.fa-trophy::before {\n  content: "\\f091";\n}\n\n.fa-person-praying::before {\n  content: "\\f683";\n}\n\n.fa-pray::before {\n  content: "\\f683";\n}\n\n.fa-hammer::before {\n  content: "\\f6e3";\n}\n\n.fa-hand-peace::before {\n  content: "\\f25b";\n}\n\n.fa-rotate::before {\n  content: "\\f2f1";\n}\n\n.fa-sync-alt::before {\n  content: "\\f2f1";\n}\n\n.fa-spinner::before {\n  content: "\\f110";\n}\n\n.fa-robot::before {\n  content: "\\f544";\n}\n\n.fa-peace::before {\n  content: "\\f67c";\n}\n\n.fa-gears::before {\n  content: "\\f085";\n}\n\n.fa-cogs::before {\n  content: "\\f085";\n}\n\n.fa-warehouse::before {\n  content: "\\f494";\n}\n\n.fa-arrow-up-right-dots::before {\n  content: "\\e4b7";\n}\n\n.fa-splotch::before {\n  content: "\\f5bc";\n}\n\n.fa-face-grin-hearts::before {\n  content: "\\f584";\n}\n\n.fa-grin-hearts::before {\n  content: "\\f584";\n}\n\n.fa-dice-four::before {\n  content: "\\f524";\n}\n\n.fa-sim-card::before {\n  content: "\\f7c4";\n}\n\n.fa-transgender::before {\n  content: "\\f225";\n}\n\n.fa-transgender-alt::before {\n  content: "\\f225";\n}\n\n.fa-mercury::before {\n  content: "\\f223";\n}\n\n.fa-arrow-turn-down::before {\n  content: "\\f149";\n}\n\n.fa-level-down::before {\n  content: "\\f149";\n}\n\n.fa-person-falling-burst::before {\n  content: "\\e547";\n}\n\n.fa-award::before {\n  content: "\\f559";\n}\n\n.fa-ticket-simple::before {\n  content: "\\f3ff";\n}\n\n.fa-ticket-alt::before {\n  content: "\\f3ff";\n}\n\n.fa-building::before {\n  content: "\\f1ad";\n}\n\n.fa-angles-left::before {\n  content: "\\f100";\n}\n\n.fa-angle-double-left::before {\n  content: "\\f100";\n}\n\n.fa-qrcode::before {\n  content: "\\f029";\n}\n\n.fa-clock-rotate-left::before {\n  content: "\\f1da";\n}\n\n.fa-history::before {\n  content: "\\f1da";\n}\n\n.fa-face-grin-beam-sweat::before {\n  content: "\\f583";\n}\n\n.fa-grin-beam-sweat::before {\n  content: "\\f583";\n}\n\n.fa-file-export::before {\n  content: "\\f56e";\n}\n\n.fa-arrow-right-from-file::before {\n  content: "\\f56e";\n}\n\n.fa-shield::before {\n  content: "\\f132";\n}\n\n.fa-shield-blank::before {\n  content: "\\f132";\n}\n\n.fa-arrow-up-short-wide::before {\n  content: "\\f885";\n}\n\n.fa-sort-amount-up-alt::before {\n  content: "\\f885";\n}\n\n.fa-house-medical::before {\n  content: "\\e3b2";\n}\n\n.fa-golf-ball-tee::before {\n  content: "\\f450";\n}\n\n.fa-golf-ball::before {\n  content: "\\f450";\n}\n\n.fa-circle-chevron-left::before {\n  content: "\\f137";\n}\n\n.fa-chevron-circle-left::before {\n  content: "\\f137";\n}\n\n.fa-house-chimney-window::before {\n  content: "\\e00d";\n}\n\n.fa-pen-nib::before {\n  content: "\\f5ad";\n}\n\n.fa-tent-arrow-turn-left::before {\n  content: "\\e580";\n}\n\n.fa-tents::before {\n  content: "\\e582";\n}\n\n.fa-wand-magic::before {\n  content: "\\f0d0";\n}\n\n.fa-magic::before {\n  content: "\\f0d0";\n}\n\n.fa-dog::before {\n  content: "\\f6d3";\n}\n\n.fa-carrot::before {\n  content: "\\f787";\n}\n\n.fa-moon::before {\n  content: "\\f186";\n}\n\n.fa-wine-glass-empty::before {\n  content: "\\f5ce";\n}\n\n.fa-wine-glass-alt::before {\n  content: "\\f5ce";\n}\n\n.fa-cheese::before {\n  content: "\\f7ef";\n}\n\n.fa-yin-yang::before {\n  content: "\\f6ad";\n}\n\n.fa-music::before {\n  content: "\\f001";\n}\n\n.fa-code-commit::before {\n  content: "\\f386";\n}\n\n.fa-temperature-low::before {\n  content: "\\f76b";\n}\n\n.fa-person-biking::before {\n  content: "\\f84a";\n}\n\n.fa-biking::before {\n  content: "\\f84a";\n}\n\n.fa-broom::before {\n  content: "\\f51a";\n}\n\n.fa-shield-heart::before {\n  content: "\\e574";\n}\n\n.fa-gopuram::before {\n  content: "\\f664";\n}\n\n.fa-earth-oceania::before {\n  content: "\\e47b";\n}\n\n.fa-globe-oceania::before {\n  content: "\\e47b";\n}\n\n.fa-square-xmark::before {\n  content: "\\f2d3";\n}\n\n.fa-times-square::before {\n  content: "\\f2d3";\n}\n\n.fa-xmark-square::before {\n  content: "\\f2d3";\n}\n\n.fa-hashtag::before {\n  content: "\\#";\n}\n\n.fa-up-right-and-down-left-from-center::before {\n  content: "\\f424";\n}\n\n.fa-expand-alt::before {\n  content: "\\f424";\n}\n\n.fa-oil-can::before {\n  content: "\\f613";\n}\n\n.fa-t::before {\n  content: "T";\n}\n\n.fa-hippo::before {\n  content: "\\f6ed";\n}\n\n.fa-chart-column::before {\n  content: "\\e0e3";\n}\n\n.fa-infinity::before {\n  content: "\\f534";\n}\n\n.fa-vial-circle-check::before {\n  content: "\\e596";\n}\n\n.fa-person-arrow-down-to-line::before {\n  content: "\\e538";\n}\n\n.fa-voicemail::before {\n  content: "\\f897";\n}\n\n.fa-fan::before {\n  content: "\\f863";\n}\n\n.fa-person-walking-luggage::before {\n  content: "\\e554";\n}\n\n.fa-up-down::before {\n  content: "\\f338";\n}\n\n.fa-arrows-alt-v::before {\n  content: "\\f338";\n}\n\n.fa-cloud-moon-rain::before {\n  content: "\\f73c";\n}\n\n.fa-calendar::before {\n  content: "\\f133";\n}\n\n.fa-trailer::before {\n  content: "\\e041";\n}\n\n.fa-bahai::before {\n  content: "\\f666";\n}\n\n.fa-haykal::before {\n  content: "\\f666";\n}\n\n.fa-sd-card::before {\n  content: "\\f7c2";\n}\n\n.fa-dragon::before {\n  content: "\\f6d5";\n}\n\n.fa-shoe-prints::before {\n  content: "\\f54b";\n}\n\n.fa-circle-plus::before {\n  content: "\\f055";\n}\n\n.fa-plus-circle::before {\n  content: "\\f055";\n}\n\n.fa-face-grin-tongue-wink::before {\n  content: "\\f58b";\n}\n\n.fa-grin-tongue-wink::before {\n  content: "\\f58b";\n}\n\n.fa-hand-holding::before {\n  content: "\\f4bd";\n}\n\n.fa-plug-circle-exclamation::before {\n  content: "\\e55d";\n}\n\n.fa-link-slash::before {\n  content: "\\f127";\n}\n\n.fa-chain-broken::before {\n  content: "\\f127";\n}\n\n.fa-chain-slash::before {\n  content: "\\f127";\n}\n\n.fa-unlink::before {\n  content: "\\f127";\n}\n\n.fa-clone::before {\n  content: "\\f24d";\n}\n\n.fa-person-walking-arrow-loop-left::before {\n  content: "\\e551";\n}\n\n.fa-arrow-up-z-a::before {\n  content: "\\f882";\n}\n\n.fa-sort-alpha-up-alt::before {\n  content: "\\f882";\n}\n\n.fa-fire-flame-curved::before {\n  content: "\\f7e4";\n}\n\n.fa-fire-alt::before {\n  content: "\\f7e4";\n}\n\n.fa-tornado::before {\n  content: "\\f76f";\n}\n\n.fa-file-circle-plus::before {\n  content: "\\e494";\n}\n\n.fa-book-quran::before {\n  content: "\\f687";\n}\n\n.fa-quran::before {\n  content: "\\f687";\n}\n\n.fa-anchor::before {\n  content: "\\f13d";\n}\n\n.fa-border-all::before {\n  content: "\\f84c";\n}\n\n.fa-face-angry::before {\n  content: "\\f556";\n}\n\n.fa-angry::before {\n  content: "\\f556";\n}\n\n.fa-cookie-bite::before {\n  content: "\\f564";\n}\n\n.fa-arrow-trend-down::before {\n  content: "\\e097";\n}\n\n.fa-rss::before {\n  content: "\\f09e";\n}\n\n.fa-feed::before {\n  content: "\\f09e";\n}\n\n.fa-draw-polygon::before {\n  content: "\\f5ee";\n}\n\n.fa-scale-balanced::before {\n  content: "\\f24e";\n}\n\n.fa-balance-scale::before {\n  content: "\\f24e";\n}\n\n.fa-gauge-simple-high::before {\n  content: "\\f62a";\n}\n\n.fa-tachometer::before {\n  content: "\\f62a";\n}\n\n.fa-tachometer-fast::before {\n  content: "\\f62a";\n}\n\n.fa-shower::before {\n  content: "\\f2cc";\n}\n\n.fa-desktop::before {\n  content: "\\f390";\n}\n\n.fa-desktop-alt::before {\n  content: "\\f390";\n}\n\n.fa-m::before {\n  content: "M";\n}\n\n.fa-table-list::before {\n  content: "\\f00b";\n}\n\n.fa-th-list::before {\n  content: "\\f00b";\n}\n\n.fa-comment-sms::before {\n  content: "\\f7cd";\n}\n\n.fa-sms::before {\n  content: "\\f7cd";\n}\n\n.fa-book::before {\n  content: "\\f02d";\n}\n\n.fa-user-plus::before {\n  content: "\\f234";\n}\n\n.fa-check::before {\n  content: "\\f00c";\n}\n\n.fa-battery-three-quarters::before {\n  content: "\\f241";\n}\n\n.fa-battery-4::before {\n  content: "\\f241";\n}\n\n.fa-house-circle-check::before {\n  content: "\\e509";\n}\n\n.fa-angle-left::before {\n  content: "\\f104";\n}\n\n.fa-diagram-successor::before {\n  content: "\\e47a";\n}\n\n.fa-truck-arrow-right::before {\n  content: "\\e58b";\n}\n\n.fa-arrows-split-up-and-left::before {\n  content: "\\e4bc";\n}\n\n.fa-hand-fist::before {\n  content: "\\f6de";\n}\n\n.fa-fist-raised::before {\n  content: "\\f6de";\n}\n\n.fa-cloud-moon::before {\n  content: "\\f6c3";\n}\n\n.fa-briefcase::before {\n  content: "\\f0b1";\n}\n\n.fa-person-falling::before {\n  content: "\\e546";\n}\n\n.fa-image-portrait::before {\n  content: "\\f3e0";\n}\n\n.fa-portrait::before {\n  content: "\\f3e0";\n}\n\n.fa-user-tag::before {\n  content: "\\f507";\n}\n\n.fa-rug::before {\n  content: "\\e569";\n}\n\n.fa-earth-europe::before {\n  content: "\\f7a2";\n}\n\n.fa-globe-europe::before {\n  content: "\\f7a2";\n}\n\n.fa-cart-flatbed-suitcase::before {\n  content: "\\f59d";\n}\n\n.fa-luggage-cart::before {\n  content: "\\f59d";\n}\n\n.fa-rectangle-xmark::before {\n  content: "\\f410";\n}\n\n.fa-rectangle-times::before {\n  content: "\\f410";\n}\n\n.fa-times-rectangle::before {\n  content: "\\f410";\n}\n\n.fa-window-close::before {\n  content: "\\f410";\n}\n\n.fa-baht-sign::before {\n  content: "\\e0ac";\n}\n\n.fa-book-open::before {\n  content: "\\f518";\n}\n\n.fa-book-journal-whills::before {\n  content: "\\f66a";\n}\n\n.fa-journal-whills::before {\n  content: "\\f66a";\n}\n\n.fa-handcuffs::before {\n  content: "\\e4f8";\n}\n\n.fa-triangle-exclamation::before {\n  content: "\\f071";\n}\n\n.fa-exclamation-triangle::before {\n  content: "\\f071";\n}\n\n.fa-warning::before {\n  content: "\\f071";\n}\n\n.fa-database::before {\n  content: "\\f1c0";\n}\n\n.fa-share::before {\n  content: "\\f064";\n}\n\n.fa-arrow-turn-right::before {\n  content: "\\f064";\n}\n\n.fa-mail-forward::before {\n  content: "\\f064";\n}\n\n.fa-bottle-droplet::before {\n  content: "\\e4c4";\n}\n\n.fa-mask-face::before {\n  content: "\\e1d7";\n}\n\n.fa-hill-rockslide::before {\n  content: "\\e508";\n}\n\n.fa-right-left::before {\n  content: "\\f362";\n}\n\n.fa-exchange-alt::before {\n  content: "\\f362";\n}\n\n.fa-paper-plane::before {\n  content: "\\f1d8";\n}\n\n.fa-road-circle-exclamation::before {\n  content: "\\e565";\n}\n\n.fa-dungeon::before {\n  content: "\\f6d9";\n}\n\n.fa-align-right::before {\n  content: "\\f038";\n}\n\n.fa-money-bill-1-wave::before {\n  content: "\\f53b";\n}\n\n.fa-money-bill-wave-alt::before {\n  content: "\\f53b";\n}\n\n.fa-life-ring::before {\n  content: "\\f1cd";\n}\n\n.fa-hands::before {\n  content: "\\f2a7";\n}\n\n.fa-sign-language::before {\n  content: "\\f2a7";\n}\n\n.fa-signing::before {\n  content: "\\f2a7";\n}\n\n.fa-calendar-day::before {\n  content: "\\f783";\n}\n\n.fa-water-ladder::before {\n  content: "\\f5c5";\n}\n\n.fa-ladder-water::before {\n  content: "\\f5c5";\n}\n\n.fa-swimming-pool::before {\n  content: "\\f5c5";\n}\n\n.fa-arrows-up-down::before {\n  content: "\\f07d";\n}\n\n.fa-arrows-v::before {\n  content: "\\f07d";\n}\n\n.fa-face-grimace::before {\n  content: "\\f57f";\n}\n\n.fa-grimace::before {\n  content: "\\f57f";\n}\n\n.fa-wheelchair-move::before {\n  content: "\\e2ce";\n}\n\n.fa-wheelchair-alt::before {\n  content: "\\e2ce";\n}\n\n.fa-turn-down::before {\n  content: "\\f3be";\n}\n\n.fa-level-down-alt::before {\n  content: "\\f3be";\n}\n\n.fa-person-walking-arrow-right::before {\n  content: "\\e552";\n}\n\n.fa-square-envelope::before {\n  content: "\\f199";\n}\n\n.fa-envelope-square::before {\n  content: "\\f199";\n}\n\n.fa-dice::before {\n  content: "\\f522";\n}\n\n.fa-bowling-ball::before {\n  content: "\\f436";\n}\n\n.fa-brain::before {\n  content: "\\f5dc";\n}\n\n.fa-bandage::before {\n  content: "\\f462";\n}\n\n.fa-band-aid::before {\n  content: "\\f462";\n}\n\n.fa-calendar-minus::before {\n  content: "\\f272";\n}\n\n.fa-circle-xmark::before {\n  content: "\\f057";\n}\n\n.fa-times-circle::before {\n  content: "\\f057";\n}\n\n.fa-xmark-circle::before {\n  content: "\\f057";\n}\n\n.fa-gifts::before {\n  content: "\\f79c";\n}\n\n.fa-hotel::before {\n  content: "\\f594";\n}\n\n.fa-earth-asia::before {\n  content: "\\f57e";\n}\n\n.fa-globe-asia::before {\n  content: "\\f57e";\n}\n\n.fa-id-card-clip::before {\n  content: "\\f47f";\n}\n\n.fa-id-card-alt::before {\n  content: "\\f47f";\n}\n\n.fa-magnifying-glass-plus::before {\n  content: "\\f00e";\n}\n\n.fa-search-plus::before {\n  content: "\\f00e";\n}\n\n.fa-thumbs-up::before {\n  content: "\\f164";\n}\n\n.fa-user-clock::before {\n  content: "\\f4fd";\n}\n\n.fa-hand-dots::before {\n  content: "\\f461";\n}\n\n.fa-allergies::before {\n  content: "\\f461";\n}\n\n.fa-file-invoice::before {\n  content: "\\f570";\n}\n\n.fa-window-minimize::before {\n  content: "\\f2d1";\n}\n\n.fa-mug-saucer::before {\n  content: "\\f0f4";\n}\n\n.fa-coffee::before {\n  content: "\\f0f4";\n}\n\n.fa-brush::before {\n  content: "\\f55d";\n}\n\n.fa-mask::before {\n  content: "\\f6fa";\n}\n\n.fa-magnifying-glass-minus::before {\n  content: "\\f010";\n}\n\n.fa-search-minus::before {\n  content: "\\f010";\n}\n\n.fa-ruler-vertical::before {\n  content: "\\f548";\n}\n\n.fa-user-large::before {\n  content: "\\f406";\n}\n\n.fa-user-alt::before {\n  content: "\\f406";\n}\n\n.fa-train-tram::before {\n  content: "\\e5b4";\n}\n\n.fa-user-nurse::before {\n  content: "\\f82f";\n}\n\n.fa-syringe::before {\n  content: "\\f48e";\n}\n\n.fa-cloud-sun::before {\n  content: "\\f6c4";\n}\n\n.fa-stopwatch-20::before {\n  content: "\\e06f";\n}\n\n.fa-square-full::before {\n  content: "\\f45c";\n}\n\n.fa-magnet::before {\n  content: "\\f076";\n}\n\n.fa-jar::before {\n  content: "\\e516";\n}\n\n.fa-note-sticky::before {\n  content: "\\f249";\n}\n\n.fa-sticky-note::before {\n  content: "\\f249";\n}\n\n.fa-bug-slash::before {\n  content: "\\e490";\n}\n\n.fa-arrow-up-from-water-pump::before {\n  content: "\\e4b6";\n}\n\n.fa-bone::before {\n  content: "\\f5d7";\n}\n\n.fa-user-injured::before {\n  content: "\\f728";\n}\n\n.fa-face-sad-tear::before {\n  content: "\\f5b4";\n}\n\n.fa-sad-tear::before {\n  content: "\\f5b4";\n}\n\n.fa-plane::before {\n  content: "\\f072";\n}\n\n.fa-tent-arrows-down::before {\n  content: "\\e581";\n}\n\n.fa-exclamation::before {\n  content: "\\!";\n}\n\n.fa-arrows-spin::before {\n  content: "\\e4bb";\n}\n\n.fa-print::before {\n  content: "\\f02f";\n}\n\n.fa-turkish-lira-sign::before {\n  content: "\\e2bb";\n}\n\n.fa-try::before {\n  content: "\\e2bb";\n}\n\n.fa-turkish-lira::before {\n  content: "\\e2bb";\n}\n\n.fa-dollar-sign::before {\n  content: "\\$";\n}\n\n.fa-dollar::before {\n  content: "\\$";\n}\n\n.fa-usd::before {\n  content: "\\$";\n}\n\n.fa-x::before {\n  content: "X";\n}\n\n.fa-magnifying-glass-dollar::before {\n  content: "\\f688";\n}\n\n.fa-search-dollar::before {\n  content: "\\f688";\n}\n\n.fa-users-gear::before {\n  content: "\\f509";\n}\n\n.fa-users-cog::before {\n  content: "\\f509";\n}\n\n.fa-person-military-pointing::before {\n  content: "\\e54a";\n}\n\n.fa-building-columns::before {\n  content: "\\f19c";\n}\n\n.fa-bank::before {\n  content: "\\f19c";\n}\n\n.fa-institution::before {\n  content: "\\f19c";\n}\n\n.fa-museum::before {\n  content: "\\f19c";\n}\n\n.fa-university::before {\n  content: "\\f19c";\n}\n\n.fa-umbrella::before {\n  content: "\\f0e9";\n}\n\n.fa-trowel::before {\n  content: "\\e589";\n}\n\n.fa-d::before {\n  content: "D";\n}\n\n.fa-stapler::before {\n  content: "\\e5af";\n}\n\n.fa-masks-theater::before {\n  content: "\\f630";\n}\n\n.fa-theater-masks::before {\n  content: "\\f630";\n}\n\n.fa-kip-sign::before {\n  content: "\\e1c4";\n}\n\n.fa-hand-point-left::before {\n  content: "\\f0a5";\n}\n\n.fa-handshake-simple::before {\n  content: "\\f4c6";\n}\n\n.fa-handshake-alt::before {\n  content: "\\f4c6";\n}\n\n.fa-jet-fighter::before {\n  content: "\\f0fb";\n}\n\n.fa-fighter-jet::before {\n  content: "\\f0fb";\n}\n\n.fa-square-share-nodes::before {\n  content: "\\f1e1";\n}\n\n.fa-share-alt-square::before {\n  content: "\\f1e1";\n}\n\n.fa-barcode::before {\n  content: "\\f02a";\n}\n\n.fa-plus-minus::before {\n  content: "\\e43c";\n}\n\n.fa-video::before {\n  content: "\\f03d";\n}\n\n.fa-video-camera::before {\n  content: "\\f03d";\n}\n\n.fa-graduation-cap::before {\n  content: "\\f19d";\n}\n\n.fa-mortar-board::before {\n  content: "\\f19d";\n}\n\n.fa-hand-holding-medical::before {\n  content: "\\e05c";\n}\n\n.fa-person-circle-check::before {\n  content: "\\e53e";\n}\n\n.fa-turn-up::before {\n  content: "\\f3bf";\n}\n\n.fa-level-up-alt::before {\n  content: "\\f3bf";\n}\n\n.sr-only,\n.fa-sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border-width: 0;\n}\n\n.sr-only-focusable:not(:focus),\n.fa-sr-only-focusable:not(:focus) {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border-width: 0;\n}\n\n/*!\n * Font Awesome Free 6.2.0 by @fontawesome - https://fontawesome.com\n * License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)\n * Copyright 2022 Fonticons, Inc.\n */\n:root, :host {\n  --fa-style-family-classic: "Font Awesome 6 Free";\n  --fa-font-regular: normal 400 1em/1 "Font Awesome 6 Free";\n}\n\n@font-face {\n  font-family: "Font Awesome 6 Free";\n  font-style: normal;\n  font-weight: 400;\n  font-display: block;\n  src: url("../webfonts/fa-regular-400.woff2") format("woff2"), url("../webfonts/fa-regular-400.ttf") format("truetype");\n}\n.far,\n.fa-regular {\n  font-weight: 400;\n}\n\n/*!\n * Font Awesome Free 6.2.0 by @fontawesome - https://fontawesome.com\n * License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)\n * Copyright 2022 Fonticons, Inc.\n */\n:root, :host {\n  --fa-style-family-brands: "Font Awesome 6 Brands";\n  --fa-font-brands: normal 400 1em/1 "Font Awesome 6 Brands";\n}\n\n@font-face {\n  font-family: "Font Awesome 6 Brands";\n  font-style: normal;\n  font-weight: 400;\n  font-display: block;\n  src: url("../webfonts/fa-brands-400.woff2") format("woff2"), url("../webfonts/fa-brands-400.ttf") format("truetype");\n}\n.fab,\n.fa-brands {\n  font-weight: 400;\n}\n\n.fa-monero:before {\n  content: "\\f3d0";\n}\n\n.fa-hooli:before {\n  content: "\\f427";\n}\n\n.fa-yelp:before {\n  content: "\\f1e9";\n}\n\n.fa-cc-visa:before {\n  content: "\\f1f0";\n}\n\n.fa-lastfm:before {\n  content: "\\f202";\n}\n\n.fa-shopware:before {\n  content: "\\f5b5";\n}\n\n.fa-creative-commons-nc:before {\n  content: "\\f4e8";\n}\n\n.fa-aws:before {\n  content: "\\f375";\n}\n\n.fa-redhat:before {\n  content: "\\f7bc";\n}\n\n.fa-yoast:before {\n  content: "\\f2b1";\n}\n\n.fa-cloudflare:before {\n  content: "\\e07d";\n}\n\n.fa-ups:before {\n  content: "\\f7e0";\n}\n\n.fa-wpexplorer:before {\n  content: "\\f2de";\n}\n\n.fa-dyalog:before {\n  content: "\\f399";\n}\n\n.fa-bity:before {\n  content: "\\f37a";\n}\n\n.fa-stackpath:before {\n  content: "\\f842";\n}\n\n.fa-buysellads:before {\n  content: "\\f20d";\n}\n\n.fa-first-order:before {\n  content: "\\f2b0";\n}\n\n.fa-modx:before {\n  content: "\\f285";\n}\n\n.fa-guilded:before {\n  content: "\\e07e";\n}\n\n.fa-vnv:before {\n  content: "\\f40b";\n}\n\n.fa-square-js:before {\n  content: "\\f3b9";\n}\n\n.fa-js-square:before {\n  content: "\\f3b9";\n}\n\n.fa-microsoft:before {\n  content: "\\f3ca";\n}\n\n.fa-qq:before {\n  content: "\\f1d6";\n}\n\n.fa-orcid:before {\n  content: "\\f8d2";\n}\n\n.fa-java:before {\n  content: "\\f4e4";\n}\n\n.fa-invision:before {\n  content: "\\f7b0";\n}\n\n.fa-creative-commons-pd-alt:before {\n  content: "\\f4ed";\n}\n\n.fa-centercode:before {\n  content: "\\f380";\n}\n\n.fa-glide-g:before {\n  content: "\\f2a6";\n}\n\n.fa-drupal:before {\n  content: "\\f1a9";\n}\n\n.fa-hire-a-helper:before {\n  content: "\\f3b0";\n}\n\n.fa-creative-commons-by:before {\n  content: "\\f4e7";\n}\n\n.fa-unity:before {\n  content: "\\e049";\n}\n\n.fa-whmcs:before {\n  content: "\\f40d";\n}\n\n.fa-rocketchat:before {\n  content: "\\f3e8";\n}\n\n.fa-vk:before {\n  content: "\\f189";\n}\n\n.fa-untappd:before {\n  content: "\\f405";\n}\n\n.fa-mailchimp:before {\n  content: "\\f59e";\n}\n\n.fa-css3-alt:before {\n  content: "\\f38b";\n}\n\n.fa-square-reddit:before {\n  content: "\\f1a2";\n}\n\n.fa-reddit-square:before {\n  content: "\\f1a2";\n}\n\n.fa-vimeo-v:before {\n  content: "\\f27d";\n}\n\n.fa-contao:before {\n  content: "\\f26d";\n}\n\n.fa-square-font-awesome:before {\n  content: "\\e5ad";\n}\n\n.fa-deskpro:before {\n  content: "\\f38f";\n}\n\n.fa-sistrix:before {\n  content: "\\f3ee";\n}\n\n.fa-square-instagram:before {\n  content: "\\e055";\n}\n\n.fa-instagram-square:before {\n  content: "\\e055";\n}\n\n.fa-battle-net:before {\n  content: "\\f835";\n}\n\n.fa-the-red-yeti:before {\n  content: "\\f69d";\n}\n\n.fa-square-hacker-news:before {\n  content: "\\f3af";\n}\n\n.fa-hacker-news-square:before {\n  content: "\\f3af";\n}\n\n.fa-edge:before {\n  content: "\\f282";\n}\n\n.fa-napster:before {\n  content: "\\f3d2";\n}\n\n.fa-square-snapchat:before {\n  content: "\\f2ad";\n}\n\n.fa-snapchat-square:before {\n  content: "\\f2ad";\n}\n\n.fa-google-plus-g:before {\n  content: "\\f0d5";\n}\n\n.fa-artstation:before {\n  content: "\\f77a";\n}\n\n.fa-markdown:before {\n  content: "\\f60f";\n}\n\n.fa-sourcetree:before {\n  content: "\\f7d3";\n}\n\n.fa-google-plus:before {\n  content: "\\f2b3";\n}\n\n.fa-diaspora:before {\n  content: "\\f791";\n}\n\n.fa-foursquare:before {\n  content: "\\f180";\n}\n\n.fa-stack-overflow:before {\n  content: "\\f16c";\n}\n\n.fa-github-alt:before {\n  content: "\\f113";\n}\n\n.fa-phoenix-squadron:before {\n  content: "\\f511";\n}\n\n.fa-pagelines:before {\n  content: "\\f18c";\n}\n\n.fa-algolia:before {\n  content: "\\f36c";\n}\n\n.fa-red-river:before {\n  content: "\\f3e3";\n}\n\n.fa-creative-commons-sa:before {\n  content: "\\f4ef";\n}\n\n.fa-safari:before {\n  content: "\\f267";\n}\n\n.fa-google:before {\n  content: "\\f1a0";\n}\n\n.fa-square-font-awesome-stroke:before {\n  content: "\\f35c";\n}\n\n.fa-font-awesome-alt:before {\n  content: "\\f35c";\n}\n\n.fa-atlassian:before {\n  content: "\\f77b";\n}\n\n.fa-linkedin-in:before {\n  content: "\\f0e1";\n}\n\n.fa-digital-ocean:before {\n  content: "\\f391";\n}\n\n.fa-nimblr:before {\n  content: "\\f5a8";\n}\n\n.fa-chromecast:before {\n  content: "\\f838";\n}\n\n.fa-evernote:before {\n  content: "\\f839";\n}\n\n.fa-hacker-news:before {\n  content: "\\f1d4";\n}\n\n.fa-creative-commons-sampling:before {\n  content: "\\f4f0";\n}\n\n.fa-adversal:before {\n  content: "\\f36a";\n}\n\n.fa-creative-commons:before {\n  content: "\\f25e";\n}\n\n.fa-watchman-monitoring:before {\n  content: "\\e087";\n}\n\n.fa-fonticons:before {\n  content: "\\f280";\n}\n\n.fa-weixin:before {\n  content: "\\f1d7";\n}\n\n.fa-shirtsinbulk:before {\n  content: "\\f214";\n}\n\n.fa-codepen:before {\n  content: "\\f1cb";\n}\n\n.fa-git-alt:before {\n  content: "\\f841";\n}\n\n.fa-lyft:before {\n  content: "\\f3c3";\n}\n\n.fa-rev:before {\n  content: "\\f5b2";\n}\n\n.fa-windows:before {\n  content: "\\f17a";\n}\n\n.fa-wizards-of-the-coast:before {\n  content: "\\f730";\n}\n\n.fa-square-viadeo:before {\n  content: "\\f2aa";\n}\n\n.fa-viadeo-square:before {\n  content: "\\f2aa";\n}\n\n.fa-meetup:before {\n  content: "\\f2e0";\n}\n\n.fa-centos:before {\n  content: "\\f789";\n}\n\n.fa-adn:before {\n  content: "\\f170";\n}\n\n.fa-cloudsmith:before {\n  content: "\\f384";\n}\n\n.fa-pied-piper-alt:before {\n  content: "\\f1a8";\n}\n\n.fa-square-dribbble:before {\n  content: "\\f397";\n}\n\n.fa-dribbble-square:before {\n  content: "\\f397";\n}\n\n.fa-codiepie:before {\n  content: "\\f284";\n}\n\n.fa-node:before {\n  content: "\\f419";\n}\n\n.fa-mix:before {\n  content: "\\f3cb";\n}\n\n.fa-steam:before {\n  content: "\\f1b6";\n}\n\n.fa-cc-apple-pay:before {\n  content: "\\f416";\n}\n\n.fa-scribd:before {\n  content: "\\f28a";\n}\n\n.fa-openid:before {\n  content: "\\f19b";\n}\n\n.fa-instalod:before {\n  content: "\\e081";\n}\n\n.fa-expeditedssl:before {\n  content: "\\f23e";\n}\n\n.fa-sellcast:before {\n  content: "\\f2da";\n}\n\n.fa-square-twitter:before {\n  content: "\\f081";\n}\n\n.fa-twitter-square:before {\n  content: "\\f081";\n}\n\n.fa-r-project:before {\n  content: "\\f4f7";\n}\n\n.fa-delicious:before {\n  content: "\\f1a5";\n}\n\n.fa-freebsd:before {\n  content: "\\f3a4";\n}\n\n.fa-vuejs:before {\n  content: "\\f41f";\n}\n\n.fa-accusoft:before {\n  content: "\\f369";\n}\n\n.fa-ioxhost:before {\n  content: "\\f208";\n}\n\n.fa-fonticons-fi:before {\n  content: "\\f3a2";\n}\n\n.fa-app-store:before {\n  content: "\\f36f";\n}\n\n.fa-cc-mastercard:before {\n  content: "\\f1f1";\n}\n\n.fa-itunes-note:before {\n  content: "\\f3b5";\n}\n\n.fa-golang:before {\n  content: "\\e40f";\n}\n\n.fa-kickstarter:before {\n  content: "\\f3bb";\n}\n\n.fa-grav:before {\n  content: "\\f2d6";\n}\n\n.fa-weibo:before {\n  content: "\\f18a";\n}\n\n.fa-uncharted:before {\n  content: "\\e084";\n}\n\n.fa-firstdraft:before {\n  content: "\\f3a1";\n}\n\n.fa-square-youtube:before {\n  content: "\\f431";\n}\n\n.fa-youtube-square:before {\n  content: "\\f431";\n}\n\n.fa-wikipedia-w:before {\n  content: "\\f266";\n}\n\n.fa-wpressr:before {\n  content: "\\f3e4";\n}\n\n.fa-rendact:before {\n  content: "\\f3e4";\n}\n\n.fa-angellist:before {\n  content: "\\f209";\n}\n\n.fa-galactic-republic:before {\n  content: "\\f50c";\n}\n\n.fa-nfc-directional:before {\n  content: "\\e530";\n}\n\n.fa-skype:before {\n  content: "\\f17e";\n}\n\n.fa-joget:before {\n  content: "\\f3b7";\n}\n\n.fa-fedora:before {\n  content: "\\f798";\n}\n\n.fa-stripe-s:before {\n  content: "\\f42a";\n}\n\n.fa-meta:before {\n  content: "\\e49b";\n}\n\n.fa-laravel:before {\n  content: "\\f3bd";\n}\n\n.fa-hotjar:before {\n  content: "\\f3b1";\n}\n\n.fa-bluetooth-b:before {\n  content: "\\f294";\n}\n\n.fa-sticker-mule:before {\n  content: "\\f3f7";\n}\n\n.fa-creative-commons-zero:before {\n  content: "\\f4f3";\n}\n\n.fa-hips:before {\n  content: "\\f452";\n}\n\n.fa-behance:before {\n  content: "\\f1b4";\n}\n\n.fa-reddit:before {\n  content: "\\f1a1";\n}\n\n.fa-discord:before {\n  content: "\\f392";\n}\n\n.fa-chrome:before {\n  content: "\\f268";\n}\n\n.fa-app-store-ios:before {\n  content: "\\f370";\n}\n\n.fa-cc-discover:before {\n  content: "\\f1f2";\n}\n\n.fa-wpbeginner:before {\n  content: "\\f297";\n}\n\n.fa-confluence:before {\n  content: "\\f78d";\n}\n\n.fa-mdb:before {\n  content: "\\f8ca";\n}\n\n.fa-dochub:before {\n  content: "\\f394";\n}\n\n.fa-accessible-icon:before {\n  content: "\\f368";\n}\n\n.fa-ebay:before {\n  content: "\\f4f4";\n}\n\n.fa-amazon:before {\n  content: "\\f270";\n}\n\n.fa-unsplash:before {\n  content: "\\e07c";\n}\n\n.fa-yarn:before {\n  content: "\\f7e3";\n}\n\n.fa-square-steam:before {\n  content: "\\f1b7";\n}\n\n.fa-steam-square:before {\n  content: "\\f1b7";\n}\n\n.fa-500px:before {\n  content: "\\f26e";\n}\n\n.fa-square-vimeo:before {\n  content: "\\f194";\n}\n\n.fa-vimeo-square:before {\n  content: "\\f194";\n}\n\n.fa-asymmetrik:before {\n  content: "\\f372";\n}\n\n.fa-font-awesome:before {\n  content: "\\f2b4";\n}\n\n.fa-font-awesome-flag:before {\n  content: "\\f2b4";\n}\n\n.fa-font-awesome-logo-full:before {\n  content: "\\f2b4";\n}\n\n.fa-gratipay:before {\n  content: "\\f184";\n}\n\n.fa-apple:before {\n  content: "\\f179";\n}\n\n.fa-hive:before {\n  content: "\\e07f";\n}\n\n.fa-gitkraken:before {\n  content: "\\f3a6";\n}\n\n.fa-keybase:before {\n  content: "\\f4f5";\n}\n\n.fa-apple-pay:before {\n  content: "\\f415";\n}\n\n.fa-padlet:before {\n  content: "\\e4a0";\n}\n\n.fa-amazon-pay:before {\n  content: "\\f42c";\n}\n\n.fa-square-github:before {\n  content: "\\f092";\n}\n\n.fa-github-square:before {\n  content: "\\f092";\n}\n\n.fa-stumbleupon:before {\n  content: "\\f1a4";\n}\n\n.fa-fedex:before {\n  content: "\\f797";\n}\n\n.fa-phoenix-framework:before {\n  content: "\\f3dc";\n}\n\n.fa-shopify:before {\n  content: "\\e057";\n}\n\n.fa-neos:before {\n  content: "\\f612";\n}\n\n.fa-hackerrank:before {\n  content: "\\f5f7";\n}\n\n.fa-researchgate:before {\n  content: "\\f4f8";\n}\n\n.fa-swift:before {\n  content: "\\f8e1";\n}\n\n.fa-angular:before {\n  content: "\\f420";\n}\n\n.fa-speakap:before {\n  content: "\\f3f3";\n}\n\n.fa-angrycreative:before {\n  content: "\\f36e";\n}\n\n.fa-y-combinator:before {\n  content: "\\f23b";\n}\n\n.fa-empire:before {\n  content: "\\f1d1";\n}\n\n.fa-envira:before {\n  content: "\\f299";\n}\n\n.fa-square-gitlab:before {\n  content: "\\e5ae";\n}\n\n.fa-gitlab-square:before {\n  content: "\\e5ae";\n}\n\n.fa-studiovinari:before {\n  content: "\\f3f8";\n}\n\n.fa-pied-piper:before {\n  content: "\\f2ae";\n}\n\n.fa-wordpress:before {\n  content: "\\f19a";\n}\n\n.fa-product-hunt:before {\n  content: "\\f288";\n}\n\n.fa-firefox:before {\n  content: "\\f269";\n}\n\n.fa-linode:before {\n  content: "\\f2b8";\n}\n\n.fa-goodreads:before {\n  content: "\\f3a8";\n}\n\n.fa-square-odnoklassniki:before {\n  content: "\\f264";\n}\n\n.fa-odnoklassniki-square:before {\n  content: "\\f264";\n}\n\n.fa-jsfiddle:before {\n  content: "\\f1cc";\n}\n\n.fa-sith:before {\n  content: "\\f512";\n}\n\n.fa-themeisle:before {\n  content: "\\f2b2";\n}\n\n.fa-page4:before {\n  content: "\\f3d7";\n}\n\n.fa-hashnode:before {\n  content: "\\e499";\n}\n\n.fa-react:before {\n  content: "\\f41b";\n}\n\n.fa-cc-paypal:before {\n  content: "\\f1f4";\n}\n\n.fa-squarespace:before {\n  content: "\\f5be";\n}\n\n.fa-cc-stripe:before {\n  content: "\\f1f5";\n}\n\n.fa-creative-commons-share:before {\n  content: "\\f4f2";\n}\n\n.fa-bitcoin:before {\n  content: "\\f379";\n}\n\n.fa-keycdn:before {\n  content: "\\f3ba";\n}\n\n.fa-opera:before {\n  content: "\\f26a";\n}\n\n.fa-itch-io:before {\n  content: "\\f83a";\n}\n\n.fa-umbraco:before {\n  content: "\\f8e8";\n}\n\n.fa-galactic-senate:before {\n  content: "\\f50d";\n}\n\n.fa-ubuntu:before {\n  content: "\\f7df";\n}\n\n.fa-draft2digital:before {\n  content: "\\f396";\n}\n\n.fa-stripe:before {\n  content: "\\f429";\n}\n\n.fa-houzz:before {\n  content: "\\f27c";\n}\n\n.fa-gg:before {\n  content: "\\f260";\n}\n\n.fa-dhl:before {\n  content: "\\f790";\n}\n\n.fa-square-pinterest:before {\n  content: "\\f0d3";\n}\n\n.fa-pinterest-square:before {\n  content: "\\f0d3";\n}\n\n.fa-xing:before {\n  content: "\\f168";\n}\n\n.fa-blackberry:before {\n  content: "\\f37b";\n}\n\n.fa-creative-commons-pd:before {\n  content: "\\f4ec";\n}\n\n.fa-playstation:before {\n  content: "\\f3df";\n}\n\n.fa-quinscape:before {\n  content: "\\f459";\n}\n\n.fa-less:before {\n  content: "\\f41d";\n}\n\n.fa-blogger-b:before {\n  content: "\\f37d";\n}\n\n.fa-opencart:before {\n  content: "\\f23d";\n}\n\n.fa-vine:before {\n  content: "\\f1ca";\n}\n\n.fa-paypal:before {\n  content: "\\f1ed";\n}\n\n.fa-gitlab:before {\n  content: "\\f296";\n}\n\n.fa-typo3:before {\n  content: "\\f42b";\n}\n\n.fa-reddit-alien:before {\n  content: "\\f281";\n}\n\n.fa-yahoo:before {\n  content: "\\f19e";\n}\n\n.fa-dailymotion:before {\n  content: "\\e052";\n}\n\n.fa-affiliatetheme:before {\n  content: "\\f36b";\n}\n\n.fa-pied-piper-pp:before {\n  content: "\\f1a7";\n}\n\n.fa-bootstrap:before {\n  content: "\\f836";\n}\n\n.fa-odnoklassniki:before {\n  content: "\\f263";\n}\n\n.fa-nfc-symbol:before {\n  content: "\\e531";\n}\n\n.fa-ethereum:before {\n  content: "\\f42e";\n}\n\n.fa-speaker-deck:before {\n  content: "\\f83c";\n}\n\n.fa-creative-commons-nc-eu:before {\n  content: "\\f4e9";\n}\n\n.fa-patreon:before {\n  content: "\\f3d9";\n}\n\n.fa-avianex:before {\n  content: "\\f374";\n}\n\n.fa-ello:before {\n  content: "\\f5f1";\n}\n\n.fa-gofore:before {\n  content: "\\f3a7";\n}\n\n.fa-bimobject:before {\n  content: "\\f378";\n}\n\n.fa-facebook-f:before {\n  content: "\\f39e";\n}\n\n.fa-square-google-plus:before {\n  content: "\\f0d4";\n}\n\n.fa-google-plus-square:before {\n  content: "\\f0d4";\n}\n\n.fa-mandalorian:before {\n  content: "\\f50f";\n}\n\n.fa-first-order-alt:before {\n  content: "\\f50a";\n}\n\n.fa-osi:before {\n  content: "\\f41a";\n}\n\n.fa-google-wallet:before {\n  content: "\\f1ee";\n}\n\n.fa-d-and-d-beyond:before {\n  content: "\\f6ca";\n}\n\n.fa-periscope:before {\n  content: "\\f3da";\n}\n\n.fa-fulcrum:before {\n  content: "\\f50b";\n}\n\n.fa-cloudscale:before {\n  content: "\\f383";\n}\n\n.fa-forumbee:before {\n  content: "\\f211";\n}\n\n.fa-mizuni:before {\n  content: "\\f3cc";\n}\n\n.fa-schlix:before {\n  content: "\\f3ea";\n}\n\n.fa-square-xing:before {\n  content: "\\f169";\n}\n\n.fa-xing-square:before {\n  content: "\\f169";\n}\n\n.fa-bandcamp:before {\n  content: "\\f2d5";\n}\n\n.fa-wpforms:before {\n  content: "\\f298";\n}\n\n.fa-cloudversify:before {\n  content: "\\f385";\n}\n\n.fa-usps:before {\n  content: "\\f7e1";\n}\n\n.fa-megaport:before {\n  content: "\\f5a3";\n}\n\n.fa-magento:before {\n  content: "\\f3c4";\n}\n\n.fa-spotify:before {\n  content: "\\f1bc";\n}\n\n.fa-optin-monster:before {\n  content: "\\f23c";\n}\n\n.fa-fly:before {\n  content: "\\f417";\n}\n\n.fa-aviato:before {\n  content: "\\f421";\n}\n\n.fa-itunes:before {\n  content: "\\f3b4";\n}\n\n.fa-cuttlefish:before {\n  content: "\\f38c";\n}\n\n.fa-blogger:before {\n  content: "\\f37c";\n}\n\n.fa-flickr:before {\n  content: "\\f16e";\n}\n\n.fa-viber:before {\n  content: "\\f409";\n}\n\n.fa-soundcloud:before {\n  content: "\\f1be";\n}\n\n.fa-digg:before {\n  content: "\\f1a6";\n}\n\n.fa-tencent-weibo:before {\n  content: "\\f1d5";\n}\n\n.fa-symfony:before {\n  content: "\\f83d";\n}\n\n.fa-maxcdn:before {\n  content: "\\f136";\n}\n\n.fa-etsy:before {\n  content: "\\f2d7";\n}\n\n.fa-facebook-messenger:before {\n  content: "\\f39f";\n}\n\n.fa-audible:before {\n  content: "\\f373";\n}\n\n.fa-think-peaks:before {\n  content: "\\f731";\n}\n\n.fa-bilibili:before {\n  content: "\\e3d9";\n}\n\n.fa-erlang:before {\n  content: "\\f39d";\n}\n\n.fa-cotton-bureau:before {\n  content: "\\f89e";\n}\n\n.fa-dashcube:before {\n  content: "\\f210";\n}\n\n.fa-42-group:before {\n  content: "\\e080";\n}\n\n.fa-innosoft:before {\n  content: "\\e080";\n}\n\n.fa-stack-exchange:before {\n  content: "\\f18d";\n}\n\n.fa-elementor:before {\n  content: "\\f430";\n}\n\n.fa-square-pied-piper:before {\n  content: "\\e01e";\n}\n\n.fa-pied-piper-square:before {\n  content: "\\e01e";\n}\n\n.fa-creative-commons-nd:before {\n  content: "\\f4eb";\n}\n\n.fa-palfed:before {\n  content: "\\f3d8";\n}\n\n.fa-superpowers:before {\n  content: "\\f2dd";\n}\n\n.fa-resolving:before {\n  content: "\\f3e7";\n}\n\n.fa-xbox:before {\n  content: "\\f412";\n}\n\n.fa-searchengin:before {\n  content: "\\f3eb";\n}\n\n.fa-tiktok:before {\n  content: "\\e07b";\n}\n\n.fa-square-facebook:before {\n  content: "\\f082";\n}\n\n.fa-facebook-square:before {\n  content: "\\f082";\n}\n\n.fa-renren:before {\n  content: "\\f18b";\n}\n\n.fa-linux:before {\n  content: "\\f17c";\n}\n\n.fa-glide:before {\n  content: "\\f2a5";\n}\n\n.fa-linkedin:before {\n  content: "\\f08c";\n}\n\n.fa-hubspot:before {\n  content: "\\f3b2";\n}\n\n.fa-deploydog:before {\n  content: "\\f38e";\n}\n\n.fa-twitch:before {\n  content: "\\f1e8";\n}\n\n.fa-ravelry:before {\n  content: "\\f2d9";\n}\n\n.fa-mixer:before {\n  content: "\\e056";\n}\n\n.fa-square-lastfm:before {\n  content: "\\f203";\n}\n\n.fa-lastfm-square:before {\n  content: "\\f203";\n}\n\n.fa-vimeo:before {\n  content: "\\f40a";\n}\n\n.fa-mendeley:before {\n  content: "\\f7b3";\n}\n\n.fa-uniregistry:before {\n  content: "\\f404";\n}\n\n.fa-figma:before {\n  content: "\\f799";\n}\n\n.fa-creative-commons-remix:before {\n  content: "\\f4ee";\n}\n\n.fa-cc-amazon-pay:before {\n  content: "\\f42d";\n}\n\n.fa-dropbox:before {\n  content: "\\f16b";\n}\n\n.fa-instagram:before {\n  content: "\\f16d";\n}\n\n.fa-cmplid:before {\n  content: "\\e360";\n}\n\n.fa-facebook:before {\n  content: "\\f09a";\n}\n\n.fa-gripfire:before {\n  content: "\\f3ac";\n}\n\n.fa-jedi-order:before {\n  content: "\\f50e";\n}\n\n.fa-uikit:before {\n  content: "\\f403";\n}\n\n.fa-fort-awesome-alt:before {\n  content: "\\f3a3";\n}\n\n.fa-phabricator:before {\n  content: "\\f3db";\n}\n\n.fa-ussunnah:before {\n  content: "\\f407";\n}\n\n.fa-earlybirds:before {\n  content: "\\f39a";\n}\n\n.fa-trade-federation:before {\n  content: "\\f513";\n}\n\n.fa-autoprefixer:before {\n  content: "\\f41c";\n}\n\n.fa-whatsapp:before {\n  content: "\\f232";\n}\n\n.fa-slideshare:before {\n  content: "\\f1e7";\n}\n\n.fa-google-play:before {\n  content: "\\f3ab";\n}\n\n.fa-viadeo:before {\n  content: "\\f2a9";\n}\n\n.fa-line:before {\n  content: "\\f3c0";\n}\n\n.fa-google-drive:before {\n  content: "\\f3aa";\n}\n\n.fa-servicestack:before {\n  content: "\\f3ec";\n}\n\n.fa-simplybuilt:before {\n  content: "\\f215";\n}\n\n.fa-bitbucket:before {\n  content: "\\f171";\n}\n\n.fa-imdb:before {\n  content: "\\f2d8";\n}\n\n.fa-deezer:before {\n  content: "\\e077";\n}\n\n.fa-raspberry-pi:before {\n  content: "\\f7bb";\n}\n\n.fa-jira:before {\n  content: "\\f7b1";\n}\n\n.fa-docker:before {\n  content: "\\f395";\n}\n\n.fa-screenpal:before {\n  content: "\\e570";\n}\n\n.fa-bluetooth:before {\n  content: "\\f293";\n}\n\n.fa-gitter:before {\n  content: "\\f426";\n}\n\n.fa-d-and-d:before {\n  content: "\\f38d";\n}\n\n.fa-microblog:before {\n  content: "\\e01a";\n}\n\n.fa-cc-diners-club:before {\n  content: "\\f24c";\n}\n\n.fa-gg-circle:before {\n  content: "\\f261";\n}\n\n.fa-pied-piper-hat:before {\n  content: "\\f4e5";\n}\n\n.fa-kickstarter-k:before {\n  content: "\\f3bc";\n}\n\n.fa-yandex:before {\n  content: "\\f413";\n}\n\n.fa-readme:before {\n  content: "\\f4d5";\n}\n\n.fa-html5:before {\n  content: "\\f13b";\n}\n\n.fa-sellsy:before {\n  content: "\\f213";\n}\n\n.fa-sass:before {\n  content: "\\f41e";\n}\n\n.fa-wirsindhandwerk:before {\n  content: "\\e2d0";\n}\n\n.fa-wsh:before {\n  content: "\\e2d0";\n}\n\n.fa-buromobelexperte:before {\n  content: "\\f37f";\n}\n\n.fa-salesforce:before {\n  content: "\\f83b";\n}\n\n.fa-octopus-deploy:before {\n  content: "\\e082";\n}\n\n.fa-medapps:before {\n  content: "\\f3c6";\n}\n\n.fa-ns8:before {\n  content: "\\f3d5";\n}\n\n.fa-pinterest-p:before {\n  content: "\\f231";\n}\n\n.fa-apper:before {\n  content: "\\f371";\n}\n\n.fa-fort-awesome:before {\n  content: "\\f286";\n}\n\n.fa-waze:before {\n  content: "\\f83f";\n}\n\n.fa-cc-jcb:before {\n  content: "\\f24b";\n}\n\n.fa-snapchat:before {\n  content: "\\f2ab";\n}\n\n.fa-snapchat-ghost:before {\n  content: "\\f2ab";\n}\n\n.fa-fantasy-flight-games:before {\n  content: "\\f6dc";\n}\n\n.fa-rust:before {\n  content: "\\e07a";\n}\n\n.fa-wix:before {\n  content: "\\f5cf";\n}\n\n.fa-square-behance:before {\n  content: "\\f1b5";\n}\n\n.fa-behance-square:before {\n  content: "\\f1b5";\n}\n\n.fa-supple:before {\n  content: "\\f3f9";\n}\n\n.fa-rebel:before {\n  content: "\\f1d0";\n}\n\n.fa-css3:before {\n  content: "\\f13c";\n}\n\n.fa-staylinked:before {\n  content: "\\f3f5";\n}\n\n.fa-kaggle:before {\n  content: "\\f5fa";\n}\n\n.fa-space-awesome:before {\n  content: "\\e5ac";\n}\n\n.fa-deviantart:before {\n  content: "\\f1bd";\n}\n\n.fa-cpanel:before {\n  content: "\\f388";\n}\n\n.fa-goodreads-g:before {\n  content: "\\f3a9";\n}\n\n.fa-square-git:before {\n  content: "\\f1d2";\n}\n\n.fa-git-square:before {\n  content: "\\f1d2";\n}\n\n.fa-square-tumblr:before {\n  content: "\\f174";\n}\n\n.fa-tumblr-square:before {\n  content: "\\f174";\n}\n\n.fa-trello:before {\n  content: "\\f181";\n}\n\n.fa-creative-commons-nc-jp:before {\n  content: "\\f4ea";\n}\n\n.fa-get-pocket:before {\n  content: "\\f265";\n}\n\n.fa-perbyte:before {\n  content: "\\e083";\n}\n\n.fa-grunt:before {\n  content: "\\f3ad";\n}\n\n.fa-weebly:before {\n  content: "\\f5cc";\n}\n\n.fa-connectdevelop:before {\n  content: "\\f20e";\n}\n\n.fa-leanpub:before {\n  content: "\\f212";\n}\n\n.fa-black-tie:before {\n  content: "\\f27e";\n}\n\n.fa-themeco:before {\n  content: "\\f5c6";\n}\n\n.fa-python:before {\n  content: "\\f3e2";\n}\n\n.fa-android:before {\n  content: "\\f17b";\n}\n\n.fa-bots:before {\n  content: "\\e340";\n}\n\n.fa-free-code-camp:before {\n  content: "\\f2c5";\n}\n\n.fa-hornbill:before {\n  content: "\\f592";\n}\n\n.fa-js:before {\n  content: "\\f3b8";\n}\n\n.fa-ideal:before {\n  content: "\\e013";\n}\n\n.fa-git:before {\n  content: "\\f1d3";\n}\n\n.fa-dev:before {\n  content: "\\f6cc";\n}\n\n.fa-sketch:before {\n  content: "\\f7c6";\n}\n\n.fa-yandex-international:before {\n  content: "\\f414";\n}\n\n.fa-cc-amex:before {\n  content: "\\f1f3";\n}\n\n.fa-uber:before {\n  content: "\\f402";\n}\n\n.fa-github:before {\n  content: "\\f09b";\n}\n\n.fa-php:before {\n  content: "\\f457";\n}\n\n.fa-alipay:before {\n  content: "\\f642";\n}\n\n.fa-youtube:before {\n  content: "\\f167";\n}\n\n.fa-skyatlas:before {\n  content: "\\f216";\n}\n\n.fa-firefox-browser:before {\n  content: "\\e007";\n}\n\n.fa-replyd:before {\n  content: "\\f3e6";\n}\n\n.fa-suse:before {\n  content: "\\f7d6";\n}\n\n.fa-jenkins:before {\n  content: "\\f3b6";\n}\n\n.fa-twitter:before {\n  content: "\\f099";\n}\n\n.fa-rockrms:before {\n  content: "\\f3e9";\n}\n\n.fa-pinterest:before {\n  content: "\\f0d2";\n}\n\n.fa-buffer:before {\n  content: "\\f837";\n}\n\n.fa-npm:before {\n  content: "\\f3d4";\n}\n\n.fa-yammer:before {\n  content: "\\f840";\n}\n\n.fa-btc:before {\n  content: "\\f15a";\n}\n\n.fa-dribbble:before {\n  content: "\\f17d";\n}\n\n.fa-stumbleupon-circle:before {\n  content: "\\f1a3";\n}\n\n.fa-internet-explorer:before {\n  content: "\\f26b";\n}\n\n.fa-telegram:before {\n  content: "\\f2c6";\n}\n\n.fa-telegram-plane:before {\n  content: "\\f2c6";\n}\n\n.fa-old-republic:before {\n  content: "\\f510";\n}\n\n.fa-square-whatsapp:before {\n  content: "\\f40c";\n}\n\n.fa-whatsapp-square:before {\n  content: "\\f40c";\n}\n\n.fa-node-js:before {\n  content: "\\f3d3";\n}\n\n.fa-edge-legacy:before {\n  content: "\\e078";\n}\n\n.fa-slack:before {\n  content: "\\f198";\n}\n\n.fa-slack-hash:before {\n  content: "\\f198";\n}\n\n.fa-medrt:before {\n  content: "\\f3c8";\n}\n\n.fa-usb:before {\n  content: "\\f287";\n}\n\n.fa-tumblr:before {\n  content: "\\f173";\n}\n\n.fa-vaadin:before {\n  content: "\\f408";\n}\n\n.fa-quora:before {\n  content: "\\f2c4";\n}\n\n.fa-reacteurope:before {\n  content: "\\f75d";\n}\n\n.fa-medium:before {\n  content: "\\f23a";\n}\n\n.fa-medium-m:before {\n  content: "\\f23a";\n}\n\n.fa-amilia:before {\n  content: "\\f36d";\n}\n\n.fa-mixcloud:before {\n  content: "\\f289";\n}\n\n.fa-flipboard:before {\n  content: "\\f44d";\n}\n\n.fa-viacoin:before {\n  content: "\\f237";\n}\n\n.fa-critical-role:before {\n  content: "\\f6c9";\n}\n\n.fa-sitrox:before {\n  content: "\\e44a";\n}\n\n.fa-discourse:before {\n  content: "\\f393";\n}\n\n.fa-joomla:before {\n  content: "\\f1aa";\n}\n\n.fa-mastodon:before {\n  content: "\\f4f6";\n}\n\n.fa-airbnb:before {\n  content: "\\f834";\n}\n\n.fa-wolf-pack-battalion:before {\n  content: "\\f514";\n}\n\n.fa-buy-n-large:before {\n  content: "\\f8a6";\n}\n\n.fa-gulp:before {\n  content: "\\f3ae";\n}\n\n.fa-creative-commons-sampling-plus:before {\n  content: "\\f4f1";\n}\n\n.fa-strava:before {\n  content: "\\f428";\n}\n\n.fa-ember:before {\n  content: "\\f423";\n}\n\n.fa-canadian-maple-leaf:before {\n  content: "\\f785";\n}\n\n.fa-teamspeak:before {\n  content: "\\f4f9";\n}\n\n.fa-pushed:before {\n  content: "\\f3e1";\n}\n\n.fa-wordpress-simple:before {\n  content: "\\f411";\n}\n\n.fa-nutritionix:before {\n  content: "\\f3d6";\n}\n\n.fa-wodu:before {\n  content: "\\e088";\n}\n\n.fa-google-pay:before {\n  content: "\\e079";\n}\n\n.fa-intercom:before {\n  content: "\\f7af";\n}\n\n.fa-zhihu:before {\n  content: "\\f63f";\n}\n\n.fa-korvue:before {\n  content: "\\f42f";\n}\n\n.fa-pix:before {\n  content: "\\e43a";\n}\n\n.fa-steam-symbol:before {\n  content: "\\f3f6";\n}\n\n/*!\n * Font Awesome Free 6.2.0 by @fontawesome - https://fontawesome.com\n * License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)\n * Copyright 2022 Fonticons, Inc.\n */\n:root, :host {\n  --fa-style-family-classic: "Font Awesome 6 Free";\n  --fa-font-solid: normal 900 1em/1 "Font Awesome 6 Free";\n}\n\n@font-face {\n  font-family: "Font Awesome 6 Free";\n  font-style: normal;\n  font-weight: 900;\n  font-display: block;\n  src: url("../webfonts/fa-solid-900.woff2") format("woff2"), url("../webfonts/fa-solid-900.ttf") format("truetype");\n}\n.fas,\n.fa-solid {\n  font-weight: 900;\n}\n\n/*! tailwindcss v3.2.4 | MIT License | https://tailwindcss.com\n */\n\n/*\n1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)\n2. Allow adding a border to an element by just adding a border-width. (https://github.com/tailwindcss/tailwindcss/pull/116)\n*/\n\n*,\n::before,\n::after {\n  box-sizing: border-box; /* 1 */\n  border-width: 0; /* 2 */\n  border-style: solid; /* 2 */\n  border-color: #e5e7eb; /* 2 */\n}\n\n::before,\n::after {\n  --tw-content: \'\';\n}\n\n/*\n1. Use a consistent sensible line-height in all browsers.\n2. Prevent adjustments of font size after orientation changes in iOS.\n3. Use a more readable tab size.\n4. Use the user\'s configured `sans` font-family by default.\n5. Use the user\'s configured `sans` font-feature-settings by default.\n*/\n\nhtml {\n  line-height: 1.5; /* 1 */\n  -webkit-text-size-adjust: 100%; /* 2 */\n  -moz-tab-size: 4; /* 3 */\n  -o-tab-size: 4;\n     tab-size: 4; /* 3 */\n  font-family: Montserrat; /* 4 */\n  font-feature-settings: normal; /* 5 */\n}\n\n/*\n1. Remove the margin in all browsers.\n2. Inherit line-height from `html` so users can set them as a class directly on the `html` element.\n*/\n\nbody {\n  margin: 0; /* 1 */\n  line-height: inherit; /* 2 */\n}\n\n/*\n1. Add the correct height in Firefox.\n2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)\n3. Ensure horizontal rules are visible by default.\n*/\n\nhr {\n  height: 0; /* 1 */\n  color: inherit; /* 2 */\n  border-top-width: 1px; /* 3 */\n}\n\n/*\nAdd the correct text decoration in Chrome, Edge, and Safari.\n*/\n\nabbr:where([title]) {\n  -webkit-text-decoration: underline dotted;\n          text-decoration: underline dotted;\n}\n\n/*\nRemove the default font size and weight for headings.\n*/\n\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n  font-size: inherit;\n  font-weight: inherit;\n}\n\n/*\nReset links to optimize for opt-in styling instead of opt-out.\n*/\n\na {\n  color: inherit;\n  text-decoration: inherit;\n}\n\n/*\nAdd the correct font weight in Edge and Safari.\n*/\n\nb,\nstrong {\n  font-weight: bolder;\n}\n\n/*\n1. Use the user\'s configured `mono` font family by default.\n2. Correct the odd `em` font sizing in all browsers.\n*/\n\ncode,\nkbd,\nsamp,\npre {\n  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; /* 1 */\n  font-size: 1em; /* 2 */\n}\n\n/*\nAdd the correct font size in all browsers.\n*/\n\nsmall {\n  font-size: 80%;\n}\n\n/*\nPrevent `sub` and `sup` elements from affecting the line height in all browsers.\n*/\n\nsub,\nsup {\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n  vertical-align: baseline;\n}\n\nsub {\n  bottom: -0.25em;\n}\n\nsup {\n  top: -0.5em;\n}\n\n/*\n1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)\n2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)\n3. Remove gaps between table borders by default.\n*/\n\ntable {\n  text-indent: 0; /* 1 */\n  border-color: inherit; /* 2 */\n  border-collapse: collapse; /* 3 */\n}\n\n/*\n1. Change the font styles in all browsers.\n2. Remove the margin in Firefox and Safari.\n3. Remove default padding in all browsers.\n*/\n\nbutton,\ninput,\noptgroup,\nselect,\ntextarea {\n  font-family: inherit; /* 1 */\n  font-size: 100%; /* 1 */\n  font-weight: inherit; /* 1 */\n  line-height: inherit; /* 1 */\n  color: inherit; /* 1 */\n  margin: 0; /* 2 */\n  padding: 0; /* 3 */\n}\n\n/*\nRemove the inheritance of text transform in Edge and Firefox.\n*/\n\nbutton,\nselect {\n  text-transform: none;\n}\n\n/*\n1. Correct the inability to style clickable types in iOS and Safari.\n2. Remove default button styles.\n*/\n\nbutton,\n[type=\'button\'],\n[type=\'reset\'],\n[type=\'submit\'] {\n  -webkit-appearance: button; /* 1 */\n  background-color: transparent; /* 2 */\n  background-image: none; /* 2 */\n}\n\n/*\nUse the modern Firefox focus style for all focusable elements.\n*/\n\n:-moz-focusring {\n  outline: auto;\n}\n\n/*\nRemove the additional `:invalid` styles in Firefox. (https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737)\n*/\n\n:-moz-ui-invalid {\n  box-shadow: none;\n}\n\n/*\nAdd the correct vertical alignment in Chrome and Firefox.\n*/\n\nprogress {\n  vertical-align: baseline;\n}\n\n/*\nCorrect the cursor style of increment and decrement buttons in Safari.\n*/\n\n::-webkit-inner-spin-button,\n::-webkit-outer-spin-button {\n  height: auto;\n}\n\n/*\n1. Correct the odd appearance in Chrome and Safari.\n2. Correct the outline style in Safari.\n*/\n\n[type=\'search\'] {\n  -webkit-appearance: textfield; /* 1 */\n  outline-offset: -2px; /* 2 */\n}\n\n/*\nRemove the inner padding in Chrome and Safari on macOS.\n*/\n\n::-webkit-search-decoration {\n  -webkit-appearance: none;\n}\n\n/*\n1. Correct the inability to style clickable types in iOS and Safari.\n2. Change font properties to `inherit` in Safari.\n*/\n\n::-webkit-file-upload-button {\n  -webkit-appearance: button; /* 1 */\n  font: inherit; /* 2 */\n}\n\n/*\nAdd the correct display in Chrome and Safari.\n*/\n\nsummary {\n  display: list-item;\n}\n\n/*\nRemoves the default spacing and border for appropriate elements.\n*/\n\nblockquote,\ndl,\ndd,\nh1,\nh2,\nh3,\nh4,\nh5,\nh6,\nhr,\nfigure,\np,\npre {\n  margin: 0;\n}\n\nfieldset {\n  margin: 0;\n  padding: 0;\n}\n\nlegend {\n  padding: 0;\n}\n\nol,\nul,\nmenu {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n}\n\n/*\nPrevent resizing textareas horizontally by default.\n*/\n\ntextarea {\n  resize: vertical;\n}\n\n/*\n1. Reset the default placeholder opacity in Firefox. (https://github.com/tailwindlabs/tailwindcss/issues/3300)\n2. Set the default placeholder color to the user\'s configured gray 400 color.\n*/\n\ninput::-moz-placeholder, textarea::-moz-placeholder {\n  opacity: 1; /* 1 */\n  color: #9ca3af; /* 2 */\n}\n\ninput::placeholder,\ntextarea::placeholder {\n  opacity: 1; /* 1 */\n  color: #9ca3af; /* 2 */\n}\n\n/*\nSet the default cursor for buttons.\n*/\n\nbutton,\n[role="button"] {\n  cursor: pointer;\n}\n\n/*\nMake sure disabled buttons don\'t get the pointer cursor.\n*/\n\n:disabled {\n  cursor: default;\n}\n\n/*\n1. Make replaced elements `display: block` by default. (https://github.com/mozdevs/cssremedy/issues/14)\n2. Add `vertical-align: middle` to align replaced elements more sensibly by default. (https://github.com/jensimmons/cssremedy/issues/14#issuecomment-634934210)\n   This can trigger a poorly considered lint error in some tools but is included by design.\n*/\n\nimg,\nsvg,\nvideo,\ncanvas,\naudio,\niframe,\nembed,\nobject {\n  display: block; /* 1 */\n  vertical-align: middle; /* 2 */\n}\n\n/*\nConstrain images and videos to the parent width and preserve their intrinsic aspect ratio. (https://github.com/mozdevs/cssremedy/issues/14)\n*/\n\nimg,\nvideo {\n  max-width: 100%;\n  height: auto;\n}\n\n/* Make elements with the HTML hidden attribute stay hidden by default */\n\n[hidden] {\n  display: none;\n}\n\n*, ::before, ::after {\n  --tw-border-spacing-x: 0;\n  --tw-border-spacing-y: 0;\n  --tw-translate-x: 0;\n  --tw-translate-y: 0;\n  --tw-rotate: 0;\n  --tw-skew-x: 0;\n  --tw-skew-y: 0;\n  --tw-scale-x: 1;\n  --tw-scale-y: 1;\n  --tw-pan-x:  ;\n  --tw-pan-y:  ;\n  --tw-pinch-zoom:  ;\n  --tw-scroll-snap-strictness: proximity;\n  --tw-ordinal:  ;\n  --tw-slashed-zero:  ;\n  --tw-numeric-figure:  ;\n  --tw-numeric-spacing:  ;\n  --tw-numeric-fraction:  ;\n  --tw-ring-inset:  ;\n  --tw-ring-offset-width: 0px;\n  --tw-ring-offset-color: #fff;\n  --tw-ring-color: rgb(59 130 246 / 0.5);\n  --tw-ring-offset-shadow: 0 0 #0000;\n  --tw-ring-shadow: 0 0 #0000;\n  --tw-shadow: 0 0 #0000;\n  --tw-shadow-colored: 0 0 #0000;\n  --tw-blur:  ;\n  --tw-brightness:  ;\n  --tw-contrast:  ;\n  --tw-grayscale:  ;\n  --tw-hue-rotate:  ;\n  --tw-invert:  ;\n  --tw-saturate:  ;\n  --tw-sepia:  ;\n  --tw-drop-shadow:  ;\n  --tw-backdrop-blur:  ;\n  --tw-backdrop-brightness:  ;\n  --tw-backdrop-contrast:  ;\n  --tw-backdrop-grayscale:  ;\n  --tw-backdrop-hue-rotate:  ;\n  --tw-backdrop-invert:  ;\n  --tw-backdrop-opacity:  ;\n  --tw-backdrop-saturate:  ;\n  --tw-backdrop-sepia:  ;\n}\n\n::backdrop {\n  --tw-border-spacing-x: 0;\n  --tw-border-spacing-y: 0;\n  --tw-translate-x: 0;\n  --tw-translate-y: 0;\n  --tw-rotate: 0;\n  --tw-skew-x: 0;\n  --tw-skew-y: 0;\n  --tw-scale-x: 1;\n  --tw-scale-y: 1;\n  --tw-pan-x:  ;\n  --tw-pan-y:  ;\n  --tw-pinch-zoom:  ;\n  --tw-scroll-snap-strictness: proximity;\n  --tw-ordinal:  ;\n  --tw-slashed-zero:  ;\n  --tw-numeric-figure:  ;\n  --tw-numeric-spacing:  ;\n  --tw-numeric-fraction:  ;\n  --tw-ring-inset:  ;\n  --tw-ring-offset-width: 0px;\n  --tw-ring-offset-color: #fff;\n  --tw-ring-color: rgb(59 130 246 / 0.5);\n  --tw-ring-offset-shadow: 0 0 #0000;\n  --tw-ring-shadow: 0 0 #0000;\n  --tw-shadow: 0 0 #0000;\n  --tw-shadow-colored: 0 0 #0000;\n  --tw-blur:  ;\n  --tw-brightness:  ;\n  --tw-contrast:  ;\n  --tw-grayscale:  ;\n  --tw-hue-rotate:  ;\n  --tw-invert:  ;\n  --tw-saturate:  ;\n  --tw-sepia:  ;\n  --tw-drop-shadow:  ;\n  --tw-backdrop-blur:  ;\n  --tw-backdrop-brightness:  ;\n  --tw-backdrop-contrast:  ;\n  --tw-backdrop-grayscale:  ;\n  --tw-backdrop-hue-rotate:  ;\n  --tw-backdrop-invert:  ;\n  --tw-backdrop-opacity:  ;\n  --tw-backdrop-saturate:  ;\n  --tw-backdrop-sepia:  ;\n}\n.relative {\n  position: relative;\n}\n.float-right {\n  float: right;\n}\n.inline {\n  display: inline;\n}\n.hidden {\n  display: none;\n}\n.h-auto {\n  height: auto;\n}\n.h-28 {\n  height: 7rem;\n}\n.w-1\\/4 {\n  width: 25%;\n}\n.w-3\\/4 {\n  width: 75%;\n}\n.transform {\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.cursor-pointer {\n  cursor: pointer;\n}\n.pb-2 {\n  padding-bottom: 0.5rem;\n}\n.text-xl {\n  font-size: 1.25rem;\n  line-height: 1.75rem;\n}\n.text-sm {\n  font-size: 0.875rem;\n  line-height: 1.25rem;\n}\n.font-medium {\n  font-weight: 500;\n}\n.capitalize {\n  text-transform: capitalize;\n}\n.transition-all {\n  transition-property: all;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n.duration-500 {\n  transition-duration: 500ms;\n}\n.ease-in-out {\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n}\n.me {\n  position: absolute;\n  bottom: 0px;\n  right: 50%;\n  z-index: -50;\n  height: 50%;\n  width: 100vw;\n  --tw-translate-x: 50%;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.me-img {\n  height: 100%;\n  background-size: contain;\n  background-repeat: no-repeat;\n  transition-property: all;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 1000ms;\n  background-position-x: center;\n  background-image: url("me.webp");\n}\n@media (min-width: 0px) and (max-width: 767px) {\n  .me-img-exp {\n    opacity: 0;\n  }\n}\n.me-img-exp {\n  background-position: calc(100% + 18vh);\n}\n@media (min-width: 0px) and (max-width: 767px) {\n  .me-img-skills {\n    opacity: 0;\n  }\n}\n.me-img-skills {\n  background-position: -18vh;\n}\n\n.navbar {\n  position: fixed;\n  top: 0px;\n  display: flex;\n  height: 100vh;\n  width: 100vw;\n  justify-content: space-between;\n  transition-property: all;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 500ms;\n  pointer-events: none;\n}\n.navbar-items {\n  height: 100%;\n  cursor: pointer;\n  background-image: linear-gradient(to top right, var(--tw-gradient-stops));\n  --tw-gradient-from: #4EA1D370;\n  --tw-gradient-to: rgb(78 161 211 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n  --tw-gradient-to: rgb(0 0 0 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), transparent, var(--tw-gradient-to);\n  --tw-gradient-to: transparent;\n  background-size: 200% 200%;\n  background-position: 100% 0%;\n  text-align: center;\n  font-weight: 500;\n  text-transform: uppercase;\n  transition-property: all;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 500ms;\n}\n.navbar-items:hover {\n  background-size: 100% 100%;\n}\n.navbar-items {\n  writing-mode: vertical-rl;\n  text-orientation: upright;\n  line-height: 25vw;\n  pointer-events: all;\n}\n.navbar-items:last-of-type {\n  background-image: linear-gradient(to top left, var(--tw-gradient-stops));\n  background-position: 0% 0%;\n}\n.navbar-exp {\n  width: 150vw;\n}\n.navbar-skills {\n  margin-left: -50vw;\n  width: 150vw;\n}\n\n@keyframes shadowAppear {\n  from {\n    box-shadow: 0px 0px 0px #000000, 0px 0px 0px #1e1e25;\n  }\n  to {\n    box-shadow: 20px 20px 60px #000000, -20px -20px 60px #1e1e25;\n  }\n}\n\n.appearing {\n  animation: shadowAppear 2s 1s ease-in-out normal forwards;\n}\n@keyframes textAppear {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n.appearing > * {\n  animation: textAppear 0.6s 1s ease-in-out normal forwards;\n  opacity: 0;\n}\n\n.bg {\n  position: fixed;\n  top: 0px;\n  z-index: -20;\n  height: 100vh;\n  width: 100vw;\n}\n\nbody {\n  height: 100vh;\n  width: 100vw;\n  overflow: hidden;\n  --tw-bg-opacity: 1;\n  background-color: rgb(14 14 17 / var(--tw-bg-opacity));\n  --tw-text-opacity: 1;\n  color: rgb(216 233 239 / var(--tw-text-opacity));\n}\n\n.mobile-btn {\n  position: fixed;\n  right: 1rem;\n  top: 0.5rem;\n  z-index: 10;\n  display: none;\n  height: 3rem;\n  width: 2.25rem;\n  cursor: pointer;\n  align-items: center;\n  justify-content: center;\n  transition-property: all;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 500ms;\n}\n\n@media (min-width: 0px) and (max-width: 767px) {\n  .mobile-btn {\n    display: flex;\n  }\n}\n.mobile-btn-click {\n  display: flex;\n  height: 100%;\n  width: 100%;\n  align-items: center;\n  justify-content: center;\n}\n.mobile-btn-burger {\n  height: 0.25rem;\n  width: 100%;\n  border-radius: 9999px;\n  --tw-bg-opacity: 1;\n  background-color: rgb(216 233 239 / var(--tw-bg-opacity));\n  transition-property: all;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 500ms;\n}\n.mobile-btn-burger::before, .mobile-btn-burger::after {\n  position: absolute;\n  height: 0.25rem;\n  width: 100%;\n  border-radius: 9999px;\n  --tw-bg-opacity: 1;\n  background-color: rgb(216 233 239 / var(--tw-bg-opacity));\n  transition-property: all;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 500ms;\n  content: "";\n}\n.mobile-btn-burger::before {\n  --tw-translate-y: -0.75rem;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.mobile-btn-burger::after {\n  --tw-translate-y: 0.75rem;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.mobile-btn .mobile-menu {\n  position: fixed;\n  top: 0px;\n  left: 0px;\n  z-index: -40;\n  display: flex;\n  height: 0px;\n  width: 100vw;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  background-color: transparent;\n  text-align: center;\n  font-size: 1.5rem;\n  line-height: 2rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  transition-property: all;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 500ms;\n}\n.mobile-btn .mobile-menu * {\n  display: none;\n  padding-top: 1rem;\n  padding-bottom: 1rem;\n}\n\n.open .mobile-btn-burger {\n  --tw-translate-x: -50%;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n  background-color: transparent;\n}\n.open .mobile-btn-burger::before {\n  --tw-translate-x: 50%;\n  --tw-translate-y: 25%;\n  --tw-rotate: 45deg;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.open .mobile-btn-burger::after {\n  --tw-translate-x: 50%;\n  --tw-translate-y: -25%;\n  --tw-rotate: -45deg;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.open .mobile-menu {\n  height: 100vh;\n  --tw-bg-opacity: 1;\n  background-color: rgb(78 161 211 / var(--tw-bg-opacity));\n}\n.open .mobile-menu * {\n  display: block;\n}\n\n.change-locale {\n  margin-top: 0.5rem;\n  margin-bottom: 0.5rem;\n  display: flex;\n}\n\n.btn_lang {\n  margin-left: 0.5rem;\n  margin-right: 0.5rem;\n  width: 2.5rem;\n  -o-object-fit: contain;\n     object-fit: contain;\n}\n\n@media (min-width: 0px) and (max-width: 767px) {\n  .sm\\:hidden {\n    display: none;\n  }\n}';
const Root = /* @__PURE__ */ componentQrl(inlinedQrl(() => {
  useStylesQrl(inlinedQrl(styles, "s_hO3b5j0m2ZI"));
  return /* @__PURE__ */ jsx(QwikSpeak, {
    config,
    translationFn,
    children: /* @__PURE__ */ jsx(QwikCity, {
      children: [
        /* @__PURE__ */ jsx("head", {
          children: [
            /* @__PURE__ */ jsx("meta", {
              charSet: "utf-8"
            }),
            /* @__PURE__ */ jsx(RouterHead, {})
          ]
        }),
        /* @__PURE__ */ jsx("body", {
          lang: "en",
          children: [
            /* @__PURE__ */ jsx(RouterOutlet, {}),
            /* @__PURE__ */ jsx(ServiceWorkerRegister, {})
          ]
        })
      ]
    })
  });
}, "s_3sccYCDd1Z0"));
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a2, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a2, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a2, prop, b[prop]);
    }
  return a2;
};
var __spreadProps = (a2, b) => __defProps(a2, __getOwnPropDescs(b));
function render(opts) {
  var _a2, _b;
  return renderToStream(/* @__PURE__ */ jsx(Root, {}), __spreadProps(__spreadValues({
    manifest
  }, opts), {
    prefetchStrategy: {
      implementation: {
        linkInsert: null,
        workerFetchInsert: null,
        prefetchEvent: "always"
      }
    },
    containerAttributes: __spreadValues({
      lang: ((_b = (_a2 = opts.envData) == null ? void 0 : _a2.locale) == null ? void 0 : _b.replace(/^\/|\/$/g, "")) || config.defaultLocale.lang
    }, opts.containerAttributes)
  }));
}
const qwikCityHandler = qwikCity(render);
export {
  qwikCityHandler as default
};
