import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Logger } from '../../src/lib/utils/logger';

describe('Logger', () => {
  let log: Logger;

  beforeEach(() => {
    log = new Logger();
    vi.restoreAllMocks();
  });

  it('should not log when disabled', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    log.debug('hidden');
    expect(spy).not.toHaveBeenCalled();
  });

  it('should log debug when enabled and level is debug', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    log.enable();
    log.setLevel('debug');
    log.debug('hello');
    expect(spy).toHaveBeenCalledWith('[ZoPassport]', 'hello');
  });

  it('should not log debug when level is warn', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    log.enable();
    log.setLevel('warn');
    log.debug('hidden');
    expect(spy).not.toHaveBeenCalled();
  });

  it('should log warn when level is warn', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    log.enable();
    log.setLevel('warn');
    log.warn('warning!');
    expect(spy).toHaveBeenCalledWith('[ZoPassport]', 'warning!');
  });

  it('should log error when level is error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    log.enable();
    log.setLevel('error');
    log.error('bad!');
    expect(spy).toHaveBeenCalledWith('[ZoPassport]', 'bad!');
  });

  it('should log info when level is info', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    log.enable();
    log.setLevel('info');
    log.info('info msg');
    expect(spy).toHaveBeenCalledWith('[ZoPassport]', 'info msg');
  });

  it('should not log anything when level is none', () => {
    const debugSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    log.enable();
    log.setLevel('none');
    log.debug('x');
    log.warn('x');
    log.error('x');
    expect(debugSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('should stop logging after disable()', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    log.enable();
    log.setLevel('debug');
    log.disable();
    log.debug('hidden');
    expect(spy).not.toHaveBeenCalled();
  });

  it('should apply custom prefix via configure()', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    log.configure({ enabled: true, level: 'debug', prefix: '[CUSTOM]' });
    log.debug('test');
    expect(spy).toHaveBeenCalledWith('[CUSTOM]', 'test');
  });
});
