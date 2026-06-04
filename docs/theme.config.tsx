import { motion } from 'motion/react';
import { useRouter } from 'nextra/hooks';
import { useConfig, type DocsThemeConfig } from 'nextra-theme-docs';
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';

const SITE = 'https://overlay-kit.slash.page';

type Locale = 'en' | 'ko';

const ASK_AI_COPY: Record<
  Locale,
  {
    trigger: string;
    items: {
      chatgpt: { title: string; desc: string };
      claude: { title: string; desc: string };
    };
  }
> = {
  en: {
    trigger: 'Ask AI',
    items: {
      chatgpt: { title: 'Open in ChatGPT', desc: 'Ask questions about this page' },
      claude: { title: 'Open in Claude', desc: 'Ask questions about this page' },
    },
  },
  ko: {
    trigger: 'AI에 묻기',
    items: {
      chatgpt: { title: 'ChatGPT에서 열기', desc: '이 페이지에 대해 질문하기' },
      claude: { title: 'Claude에서 열기', desc: '이 페이지에 대해 질문하기' },
    },
  },
};

function buildAskAiUrls(asPath: string, locale: Locale) {
  const cleanPath = asPath.replace(/[#?].*$/, '');
  const withLocale = cleanPath.startsWith(`/${locale}/`) ? cleanPath : `/${locale}${cleanPath}`;
  const pageUrl = `${SITE}${withLocale}`;
  const prompt = `Read ${pageUrl}, I want to ask questions about it.`;
  return {
    chatgpt: `https://chatgpt.com/?hints=search&q=${encodeURIComponent(prompt)}`,
    claude: `https://claude.ai/new?q=${encodeURIComponent(prompt)}`,
  };
}

function AskAi() {
  const router = useRouter();
  const locale: Locale = router.locale === 'ko' ? 'ko' : 'en';
  const asPath = router.asPath ?? '/';

  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [asPath]);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const pathOnly = asPath.replace(/^\/(?:en|ko)(?=\/|$)/, '') || '/';
  if (!/^\/(docs|api)(\/|$)/.test(pathOnly)) {
    return null;
  }

  const urls = buildAskAiUrls(asPath, locale);
  const labels = ASK_AI_COPY[locale];

  return (
    <div ref={wrapRef} style={askAiStyles.wrap}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        style={askAiStyles.trigger}
      >
        <SparkleIcon />
        <span>{labels.trigger}</span>
        <CaretIcon open={open} />
      </button>
      {open && (
        <div role="menu" style={askAiStyles.menu}>
          <AskAiItem
            href={urls.chatgpt}
            icon={<ChatGPTIcon />}
            title={labels.items.chatgpt.title}
            desc={labels.items.chatgpt.desc}
            onSelect={() => setOpen(false)}
          />
          <AskAiItem
            href={urls.claude}
            icon={<ClaudeIcon />}
            title={labels.items.claude.title}
            desc={labels.items.claude.desc}
            onSelect={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

function AskAiItem({
  href,
  icon,
  title,
  desc,
  onSelect,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  desc: string;
  onSelect: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={onSelect}
      role="menuitem"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...askAiStyles.item, ...(hover ? askAiStyles.itemHover : null) }}
    >
      <span style={askAiStyles.itemIcon}>{icon}</span>
      <span style={askAiStyles.itemBody}>
        <span style={askAiStyles.itemTitle}>{title}</span>
        <span style={askAiStyles.itemDesc}>{desc}</span>
      </span>
      <span style={askAiStyles.itemExternal} aria-hidden="true">
        <ExternalIcon />
      </span>
    </a>
  );
}

function SparkleIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 2v3M8 11v3M2 8h3M11 8h3M4 4l2 2M10 10l2 2M12 4l-2 2M6 10l-2 2" />
    </svg>
  );
}

function CaretIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
      aria-hidden="true"
    >
      <path d="M3 4.5 6 7.5l3-3" />
    </svg>
  );
}

function ChatGPTIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="9" />
      <path d="M3.5 9h17M3.5 15h17M9 3.5v17M15 3.5v17" />
    </svg>
  );
}

function ClaudeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v18M3 12h18M5.5 5.5l13 13M18.5 5.5l-13 13" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 3.5h3.5V7" />
      <path d="M12.5 3.5 7 9" />
      <path d="M11.5 9v3a.5.5 0 0 1-.5.5H4a.5.5 0 0 1-.5-.5V5a.5.5 0 0 1 .5-.5h3" />
    </svg>
  );
}

const askAiStyles: Record<string, CSSProperties> = {
  wrap: {
    position: 'relative',
    display: 'inline-flex',
    marginBlockEnd: 16,
  },
  trigger: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 32,
    paddingInline: 12,
    fontSize: 13,
    fontWeight: 500,
    color: 'currentColor',
    background: 'rgba(127, 127, 127, 0.08)',
    border: '1px solid rgba(127, 127, 127, 0.18)',
    borderRadius: 999,
    cursor: 'pointer',
  },
  menu: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    right: 0,
    minWidth: 280,
    padding: 6,
    borderRadius: 12,
    background: 'var(--ask-ai-menu-bg, #ffffff)',
    color: 'var(--ask-ai-menu-fg, #111111)',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.05)',
    zIndex: 50,
  },
  item: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: '8px 10px',
    borderRadius: 8,
    color: 'inherit',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  itemHover: {
    background: 'rgba(127, 127, 127, 0.12)',
  },
  itemIcon: {
    flex: '0 0 auto',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    marginTop: 1,
  },
  itemBody: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    minWidth: 0,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 600,
    lineHeight: 1.3,
  },
  itemDesc: {
    fontSize: 12,
    color: 'rgba(127, 127, 127, 1)',
    lineHeight: 1.4,
  },
  itemExternal: {
    flex: '0 0 auto',
    display: 'inline-flex',
    alignItems: 'center',
    color: 'rgba(127, 127, 127, 1)',
    marginTop: 4,
  },
};

const config: DocsThemeConfig = {
  logo: () => {
    const router = useRouter();
    if (router.pathname === '/ko' || router.pathname === '/en') {
      return <></>;
    }
    return (
      <motion.strong initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        overlay-kit
      </motion.strong>
    );
  },
  head: function Head() {
    const config = useConfig<{ description?: string }>();
    const { asPath, defaultLocale, locale } = useRouter();

    const title = config.title !== 'Index' ? `${config.title} - overlay-kit` : 'overlay-kit';
    const description = config.frontMatter.description ?? 'A library for handling overlays more easily in React';
    const url = 'https://overlay-kit.slash.page' + (defaultLocale === locale ? asPath : `/${locale}${asPath}`);

    return (
      <>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="alternate" hrefLang="ko" href="https://overlay-kit.slash.page/ko" />
        <link rel="alternate" hrefLang="en" href="https://overlay-kit.slash.page/en" />
        <meta
          property="keywords"
          content="overlay-kit, overlay, 오버레이 관리, 모달 관리, 다이얼로그 관리, overlay state, state management, react, react-native, rn"
        />
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title ?? 'overlay-kit'} />
        <meta property="og:url" content={url} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content="/logo-dark.png" />
        <link rel="icon" href="/favicon.ico" type="image/ico" />
      </>
    );
  },
  main: function Main({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    return (
      <motion.div key={router.asPath} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <AskAi />
        </div>
        {children}
      </motion.div>
    );
  },
  footer: {
    content: `MIT ${new Date().getFullYear()} © Viva Republica, Inc.`,
  },
  project: {
    link: 'https://github.com/toss/overlay-kit',
  },
  chat: {
    link: 'https://discord.gg/vGXbVjP2nY',
  },
  docsRepositoryBase: 'https://github.com/toss/overlay-kit/tree/main/docs',
  i18n: [
    { locale: 'en', name: 'English' },
    { locale: 'ko', name: '한국어' },
  ],
  search: {
    placeholder: function Placeholder() {
      const router = useRouter();

      if (router.locale === 'ko') {
        return '검색어를 입력하세요...';
      }

      return 'Search documentation...';
    },
  },
};

export default config;
