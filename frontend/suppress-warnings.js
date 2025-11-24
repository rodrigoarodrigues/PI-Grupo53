// Suprime avisos conhecidos de dependências externas
// Este aviso vem do react-native-web ao processar classes CSS pointer-events
if (typeof console !== 'undefined') {
  // Suprime console.warn
  if (console.warn) {
    const originalWarn = console.warn;
    console.warn = function (...args) {
      // Suprime aviso sobre pointerEvents deprecated do react-native-web
      const message = args[0];
      if (
        message &&
        (typeof message === 'string' || message.toString) &&
        (message.toString().includes('props.pointerEvents is deprecated') ||
         message.toString().includes('Use style.pointerEvents'))
      ) {
        return; // Não exibe este aviso específico
      }
      originalWarn.apply(console, args);
    };
  }

  // Suprime console.log para mensagens do Expo/Metro
  if (console.log) {
    const originalLog = console.log;
    console.log = function (...args) {
      const message = args.join(' ');
      
      // Suprime mensagens de bundling do Expo
      if (
        message.includes('Web Bundled') ||
        message.includes('Bundled') ||
        message.includes('[web] Logs will appear in the browser console') ||
        message.includes('LOG [web]') ||
        message.includes('node_modules\\expo-router') ||
        message.includes('(1 module)')
      ) {
        return; // Não exibe essas mensagens
      }
      
      originalLog.apply(console, args);
    };
  }
}

