from gallery_dl.extractor import find as find_extractor
from gallery_dl import job
import os


def download_post(url):
    extractor = find_extractor(url)
    data_job = job.DataJob(extractor, file=None)

    with open(os.devnull, "w") as f:
        data_job.file = f
        data_job.run()

    if data_job.exception:
        raise data_job.exception

    return {
        "metadata": data_job.data_meta,
        "post": data_job.data_post,
        "urls": data_job.data_urls,
    }
