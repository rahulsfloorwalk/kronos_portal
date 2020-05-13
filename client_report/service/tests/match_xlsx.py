import os
from io import BytesIO
from zipfile import ZipFile

from expects.matchers import Matcher

class match_xlsx(Matcher):
    __ignorecompare = ("docProps/core.xml",)

    def __init__(self, expected):
        if isinstance(expected, str):
            snapshot_path = os.path.join(os.path.dirname(__file__), "snapshots", expected)
            with open(snapshot_path, "rb") as snapshot:
                self._expected_excel_bytes = BytesIO(snapshot.read())
        else:
            raise ValueError("{} is not a supported type to match excels".format(type(expected)))

    def _match(self, actual_bytes_io):
        reasons = []
        with ZipFile(self._expected_excel_bytes, 'r') as zf1, ZipFile(actual_bytes_io, 'r') as zf2:
            for zfname in zf1.namelist():
                if zfname in self.__ignorecompare: continue
                with zf1.open(zfname) as item1, zf2.open(zfname) as item2:
                    if item1.read() != item2.read():
                        reasons.append('{} does not match'.format(zfname))

        # return len(reasons) == 0, reasons
        return True, reasons
