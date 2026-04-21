import re
from urllib.parse import urlparse
import socket
import whois
from datetime import datetime

class URLFeatureExtractor:
    SPECIAL_CHARS = set('!@#$%^&*()_+-=[]{}|;:,.<>?')

    def __init__(self):
        self.cache = {}

    def extract(self, url):
        try:
            parsed = urlparse(url)
            domain = parsed.netloc
            features = {
                'url_length': len(url),
                'special_char_count': sum(1 for c in url if c in self.SPECIAL_CHARS),
                'has_ip': self._has_ip_format(domain),
                'subdomain_count': self._count_subdomains(domain),
                'uses_https': 1 if parsed.scheme == 'https' else 0,
                'domain_age_days': self._get_domain_age(domain),
                'digit_count': sum(c.isdigit() for c in url),
                'dot_count': url.count('.'),
                'has_at_symbol': 1 if '@' in url else 0,
                'has_double_slash': 1 if '//' in url else 0,
                'url_entropy': self._calculate_entropy(url),
                'path_length': len(parsed.path),
                'query_params_count': len(parsed.query.split('&')) if parsed.query else 0,
            }
            return features
        except Exception:
            return self._default_features()

    def _has_ip_format(self, domain):
        ip_pattern = r'^(\d{1,3}\.){3}\d{1,3}$'
        return 1 if re.match(ip_pattern, domain) else 0

    def _count_subdomains(self, domain):
        if not domain:
            return 0
        parts = domain.split('.')
        return max(0, len(parts) - 2)

    def _get_domain_age(self, domain):
        try:
            if domain in self.cache:
                return self.cache[domain]
            w = whois.whois(domain)
            if w and w.creation_date:
                if isinstance(w.creation_date, list):
                    creation = w.creation_date[0]
                else:
                    creation = w.creation_date
                age = (datetime.now() - creation).days
                self.cache[domain] = age
                return age
        except:
            pass
        return -1

    def _calculate_entropy(self, text):
        if not text:
            return 0
        from collections import Counter
        frequencies = Counter(text)
        length = len(text)
        entropy = 0
        for count in frequencies.values():
            prob = count / length
            if prob > 0:
                entropy -= prob * (prob ** 0.5 if prob < 1 else prob)
        return round(entropy, 4)

    def _default_features(self):
        return {
            'url_length': 0,
            'special_char_count': 0,
            'has_ip': 0,
            'subdomain_count': 0,
            'uses_https': 0,
            'domain_age_days': -1,
            'digit_count': 0,
            'dot_count': 0,
            'has_at_symbol': 0,
            'has_double_slash': 0,
            'url_entropy': 0,
            'path_length': 0,
            'query_params_count': 0,
        }

    def to_vector(self, features):
        order = [
            'url_length', 'special_char_count', 'has_ip', 'subdomain_count',
            'uses_https', 'domain_age_days', 'digit_count', 'dot_count',
            'has_at_symbol', 'has_double_slash', 'url_entropy',
            'path_length', 'query_params_count'
        ]
        vector = []
        for key in order:
            val = features.get(key, -1)
            if val == -1:
                val = 0
            vector.append(val)
        return [vector]