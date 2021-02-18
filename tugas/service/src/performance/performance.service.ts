import { summary } from './performance';

export interface respondOption {
  setHeader: (key: string, val: string) => void;
  write: (data: string) => void;
  end: () => void;
  statusCode: number;
}

export async function summarySvc(req: any, res: respondOption): Promise<void> {
  try {
    const sums = await summary();
    res.setHeader('content-type', 'application/json');
    res.write(JSON.stringify(sums));
    res.end();
  } catch (err) {
    res.statusCode = 500;
    res.end();
    return;
  }
}
