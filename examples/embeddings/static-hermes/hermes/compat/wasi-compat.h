// Force-included into every Hermes source when building for WASI, for what
// wasi-libc and libc++ lack or no longer include transitively. Hermes never
// calls the process and signal stubs at runtime; only llvh's Support library
// references them.
#pragma once

#include <errno.h>
#include <signal.h>
#include <sys/types.h>
#include <time.h>

#ifdef __cplusplus
#include <exception>
#include <type_traits>
extern "C" {
#endif

// no time zones: dates are always UTC
static inline void tzset(void) {}

// no CPU clocks: thread CPU time is wall time
#ifndef CLOCK_THREAD_CPUTIME_ID
#define CLOCK_THREAD_CPUTIME_ID CLOCK_MONOTONIC
#endif

// no signals
#ifndef SA_RESTART
#define SA_NODEFER 0x40000000
#define SA_RESETHAND 0x80000000
#define SA_ONSTACK 0x08000000
#define SA_RESTART 0x10000000
struct sigaction {
  void (*sa_handler)(int);
  sigset_t sa_mask;
  int sa_flags;
};
#endif
#ifndef SIG_BLOCK
#define SIG_BLOCK 0
#define SIG_UNBLOCK 1
#define SIG_SETMASK 2
#endif
static inline int sigaction(int sig, const struct sigaction *act, struct sigaction *old) {
  (void)sig, (void)act, (void)old;
  errno = ENOSYS;
  return -1;
}
static inline int sigfillset(sigset_t *set) { (void)set; return 0; }
static inline int sigemptyset(sigset_t *set) { (void)set; return 0; }
static inline int sigprocmask(int how, const sigset_t *set, sigset_t *old) {
  (void)how, (void)set, (void)old;
  return 0;
}
static inline int pthread_sigmask(int how, const sigset_t *set, sigset_t *old) {
  return sigprocmask(how, set, old);
}
static inline unsigned alarm(unsigned seconds) { (void)seconds; return 0; }

// no processes
static inline pid_t fork(void) { errno = ENOSYS; return -1; }
static inline int execv(const char *path, char *const argv[]) {
  (void)path, (void)argv;
  errno = ENOSYS;
  return -1;
}
static inline int execve(const char *path, char *const argv[], char *const envp[]) {
  (void)path, (void)argv, (void)envp;
  errno = ENOSYS;
  return -1;
}
static inline int kill(pid_t pid, int sig) { (void)pid, (void)sig; errno = ENOSYS; return -1; }

#ifdef __cplusplus
}
#endif
